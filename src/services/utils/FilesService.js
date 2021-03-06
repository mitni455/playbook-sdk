const fs = require('fs');
const os = require('os');
const glob = require('glob');
const chalk = require('chalk');
const path = require('path');
const rimraf = require("rimraf");

/**
 * @requires Services
 */
const transformId = require('./transformId');

/**
 * @requires Models 
 */
const FileModel = require('../../models/FileModel');
const FolderModel = require('../../models/FolderModel');

/**
 * @requires Errors 
 */
const {
    NoCategoriesFoundError,
    NoScenesFoundError,
    NoStepsFoundError,
    FileSystemError,
} = require('../../errors');

/** 
 * Look ma, it's cp -R. 
 * @param {string} src The path to the thing to copy. 
 * @param {string} dest The path to the new copy. 
 * */ 
const copyRecursiveSync = (src, dest) => { 
    var exists = fs.existsSync(src); 
    var stats = exists && fs.statSync(src); 
    
    var isDirectory = exists && stats.isDirectory(); 
    
    if (exists && isDirectory) { 
        fs.mkdirSync(dest); 
        fs.readdirSync(src).forEach(childItemName => { 
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName)); 
        }); 
    } 
    else { 
        fs.copyFileSync(src, dest); // UPDATE FROM: fs.linkSync(src, dest); 
    } 
};

/**
 * File Service is a helper wrapper to extend fs and glob 
 *
 * @class FileService
 */
class FileService{

    constructor()
    {
        this.homeDir = path.resolve(os.homedir(), '.playbook');
        const hasPlaybookFolder = this.checkFolderExists(this.homeDir);
        if(!hasPlaybookFolder){
            console.warn(chalk.cyan('There is no .playbook folder, so I\'m going to create one'));
            this.createPlaybookFolder();
        }
    }

    /**
     * Create a .playbook folder if it doesn't exist
     */
    createPlaybookFolder(){
        try{
            this.createFolder(os.homedir(), '.playbook');
        }
        catch(err){
            console.error(chalk.red('I am very sorry, but I could NOT create a .playbook folder in the home directory of ')+this.homeDir);
            console.error(chalk.gray('Error logs:\n'+err.message));
        }
    }

    /**
     * Check the folder exists
     * @param {string} fullPathToFolder - full path to the folder to check
     * @returns 
     */
    checkFolderExists(fullPathToFolder){
        return fs.existsSync(fullPathToFolder) && fs.lstatSync(fullPathToFolder).isDirectory();
    }
    /**
     * Check the file exists
     * @param {string} fullPathToFile - full path to the file to check
     * @returns 
     */
    checkFileExists(fullPathToFile){
        return fs.existsSync(fullPathToFile) && fs.lstatSync(fullPathToFile).isFile();
    }

    /**
     * Copy folder from source path to destination 
     *
     * @param {FolderModel} source - path to the folder
     * @param {string} destination - path to the folder
     */
    copyFolder(sourceFolderModel, destination) {
        rimraf.sync(destination);
        copyRecursiveSync(sourceFolderModel.path, destination);
        return new FolderModel(destination);
    }


    /**
     * Returns the file paths and contents of files matching a pattern like '*.playbook.js'
     * 
     * @param {string} fromFolder - path to start search from 
     * @param {string} filePattern - e.g. "*.playbook.js"
     * @returns {Array<IFile>} playbookFiles - array of paths to the playbook files and the contents 
     * @memberof Controller
     * @usage FileService.findAll(process.cwd(), '*.playbook.js')
     */
    findAll(fromFolder, filePattern){

        /** 
         * @step set defaults and validate 
         */
        fromFolder = fromFolder || process.cwd(); 
        filePattern = filePattern || '*.playbook.js';

        /** 
         * @step find all paths 
         * @requires glob 
         */
        const filePaths = glob.sync(fromFolder + `/**/${filePattern}`, {});

        /** 
         * @step map file paths to file model so includes contents too 
         * @description this is easier to deal with files this way 
         */
        const fileModels = filePaths.map(filePath => {
            /**
             * @step add cwd to the path 
             * @desc this will complain sometimes so it's safer with the full path
             */
            // filePath = path.join(process.cwd(), filePath); 
            filePath = path.resolve(fromFolder, filePath); 
            return new FileModel(filePath);
        });

        return fileModels;
    }

    /**
     * Returns the file paths and contents of files matching a pattern like '*.playbook.js'
     * 
     * @param {string} filePattern - e.g. "*.playbook.js"
     * @returns {Array<IFile>} playbookFiles - array of paths to the playbook files and the contents 
     * @returns {string} playbookFiles[0].path - path to the file 
     * @returns {string} playbookFiles[0].contents - contents of the file 
     * @memberof Controller
     * @usage FileService.findAll('*.playbook.js')
     */
    findAllCwd(filePattern){
        return this.findAll(process.cwd() , filePattern);
    }

    /**
     * Create Folder helper
     *
     * @param {*} folderPath
     * @param {*} folderName
     * @returns {FolderModel} folderModel
     * @memberof FileService
     */
    createFolder(folderPath, folderName)
    {
        const fullFolderPath = !!folderName ? path.join(folderPath, folderName): folderPath;
        try
        {
            fs.mkdirSync(fullFolderPath, { recursive : true });
            return new FolderModel(fullFolderPath);
        }
        catch(err)
        {
            console.log(`Error is writing the file: ${chalk.red('err.message')}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
        }
    }

    /**
     * Create File helper 
     *
     * @param {string} filePath - path to the folder 
     * @param {string} fileName - name of the file with the extension
     * @param {string} fileContents - contents to save into the file 
     * @returns {FileModel} fileModel - file model is a nice wrapper for path and the contents 
     * @memberof FileService
     */
    createFile(filePath, fileName, fileContents){
        const fullFilePath = path.resolve(filePath, fileName);
        console.log("createFile(filePath, fileName, fileContents)====> ", {filePath, fileName, fileContents});
        try{
            fs.writeFileSync(fullFilePath, fileContents, {encoding:'utf8'});
            return new FileModel(fullFilePath, fileContents);
        }catch(err){
            console.log(`Error is writing the file: ${chalk.red('err.message')}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
        }

    }

    /**
     *
     *
     * @param {string} folderPath - path to where this folder is installed
     * @param {string} folderName - name of the folder
     * @returns {FolderModel} folderModel - folder model 
     * @memberof FileService
     */
    createFolder(folderPath, folderName){
        const fullFilePath = path.join(folderPath, folderName);
        try{
            fs.mkdirSync(fullFilePath, { recursive : true });
            return new FolderModel(fullFilePath);
        }catch(err){
            console.log(`Error is writing the file: ${chalk.red(err.message)}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
        }
    }

    deleteFolder(folderPath) {
        try
        {
            rimraf.sync(folderPath);
        }
        catch(err)
        {
            console.log(`Error is writing the file: ${chalk.red(err.message)}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
        }
    }

    /**
     * @todo implement 
     *
     * @returns
     * @memberof FileService
     */
    mvFile(){
        return 'todo'
    }
    mvFolder(){

    }
    /**
     * @todo implement append to file 
     *
     * @memberof FileService
     */
    appendToFile(){
        
    }
    prependToFile(){
        
    }

    /**
     * @todo implement append to file 
     *
     * @memberof FileService
     */
    ls(folderPath){

        const folderName = folderPath.split('/').pop();
        console.log( chalk.blue('List files and folders from: ')+chalk.bgMagenta.bold(folderName) + chalk.bgBlue.white(folderPath) );

        fs.readdirSync(folderPath).forEach(file => {
            console.log('• '+fileModel.path.replace(folderPath,''));
        });
    }
    lsAll(folderPath, txtOptionalMsg){

        txtOptionalMsg = txtOptionalMsg ? txtOptionalMsg : 'List ALL files and folders from: '; 
        const folderName = folderPath.split('/').pop();
        console.log('\n'+ chalk.green(txtOptionalMsg)+chalk.bgMagenta.bold(folderName) +'\n'+ chalk.blue(folderPath));

        const fileModels = this.findAll(folderPath, '*');
        fileModels.forEach(fileModel => {
            console.log('• '+fileModel.path.replace(folderPath,''));
        })
    }





    findFile(folderPath, fileName) {

        const filePath = path.resolve(folderPath, fileName);

        try
        {
            let fileData = fs.readFileSync(filePath);
            return new FileModel(filePath, fileData.toString())
        }
        catch(err)
        {
            throw err;
        }
    }

    /**
     * @method findNextId 
     * @desc Find next ID for the cat, scene or step
     * @param {'cat' | 'scene' | 'step'} prefix - "cat", "scene", "step"
     * @param {Category[] | Scene[] | Step[]} values - array of categories, scenes, steps
     * @returns {number} nextId
     */
    findNextId(prefix, values){
        const lastId = [0, ...values].reduce((previous, current)=>{
            const id = current.replace(prefix, '');
            return parseInt(id) || previous;
        });
        return lastId+1;
    }
    /**
     * @method findNextCatId 
     * @desc Find next ID for the cat
     * @param {Category[] } cats - array of categories
     */
    findNextCatId(cats){
        return this.findNextId('cat', cats);
    }
    /**
     * @method findNextSceneId 
     * @desc Find next ID for the scene
     * @param {Scenes[] } scenes - array of scenes
     */
    findNextSceneId(scenes){
        return this.findNextId('scene', scenes);
    }
    /**
     * @method findNextStepId 
     * @desc Find next ID for the steps
     * @param {Step[] } steps - array of steps
     */
    findNextStepId(steps){
        return this.findNextId('step', steps);
    }

    /**
     * Find all the categories in a folder 
     * 
     * @desc cats folders MUST start with "cat"
     * 
     * @param {string} pathToCatFolder - path to look for cats in
     * @returns {{string[], number}} {categories: string[], nextCatId: number}
     */
    findCategories(pathToCatFolder){
        let categories; 
        try{
            categories = fs.readdirSync(pathToCatFolder).filter(file => file.startsWith('cat'));
        }
        catch(err){
            throw new FileSystemError(err);
        }
        if(!categories){
            throw new NoCategoriesFoundError(pathToCatFolder, fs.readdirSync(pathToCatFolder));
        }

        return {
            categories: categories,
            nextCatId: this.findNextCatId(categories),
        };
    }
    /**
     * Find the last category in a folder 
     * 
     * @desc 
     *  • cats folders MUST start with "cat" 
     *  • and SHOULD start with "cat01" to be in order
     * 
     * @param {string} pathToCatFolder - path to look for cats in
     * 
     * @returns {string[]} category paths
     */
    findLastCat(pathToCatFolder){
        const cats = this.findCategories(pathToCatFolder);
        if(cats.length > 0){
            const lastCat = cats[cats.length-1];
            return lastCat;
        }
        else{
            return false;
        }
    }

    /**
     * @method findScenes
     * @desc 
     *  Find all the scenes in a folder 
     *  • scenes folders MUST start with "scene"
     * 
     * @param {string} pathToSceneFolder - path to look for scenes in
     * @returns { { scenes:string[], nextSceneId: number } } 
     *  scenes:string[] - scene paths
     *  nextSceneId: number - e.g. 1 for "scene01"
     */
     findScenes(pathToSceneFolder){
        let scenes; 
        try{
            scenes = fs.readdirSync(pathToSceneFolder).filter(file => file.startsWith('scene'));
        }
        catch(err){
            throw new FileSystemError(err);
        }
        if(!scenes){
            throw new NoScenesFoundError(pathToSceneFolder, fs.readdirSync(pathToSceneFolder));
        }

        return {
            scenes,
            nextSceneId: this.findNextSceneId(scenes),
        };
    }
    /**
     * @method findLastScene
     * @desc 
     *  Find the last scene in a folder 
     *  • scenes folders MUST start with "scene" 
     *  • and SHOULD start with "scene01" to be in order
     * 
     * @param {string} pathToSceneFolder - path to look for scenes in
     * 
     * @returns {string[]} scene paths
     */
    findLastScene(pathToSceneFolder){
        const scenes = this.findScenes(pathToSceneFolder);
        if(scenes.length > 0){
            const lastScene = scenes[scenes.length-1];
            return lastScene;
        }
        else{
            return false;
        }
    }
    
    /**
     * @method findSteps
     * @desc 
     *  Find all the steps in a folder 
     *  • steps folders MUST start with "step"
     * 
     * @param {string} pathToStepFolder - path to look for steps in
     * @returns {string[]} step paths
     */
     findSteps(pathToStepFolder){
        let steps; 
        try{
            steps = fs.readdirSync(pathToStepFolder).filter(file => file.startsWith('step'));
        }
        catch(err){
            throw new FileSystemError(err);
        }
        if(!steps){
            throw new NoStepsFoundError(pathToStepFolder, fs.readdirSync(pathToStepFolder));
        }

        return {
            steps,
            nextStepId: this.findNextStepId(steps),
        };
    }
    /**
     * @method findLastStep
     * @desc 
     *  Find the last step in a folder 
     *  • steps folders MUST start with "step" 
     *  • and SHOULD start with "step01" to be in order
     * 
     * @param {string} pathToStepFolder - path to look for steps in
     * 
     * @returns {string[]} step paths
     */
    findLastStep(pathToStepFolder){
        const steps = this.findSteps(pathToStepFolder);
        if(steps.length > 0){
            const lastScene = steps[steps.length-1];
            return lastScene;
        }
        else{
            return false;
        }
    }

}

module.exports = new FileService();
