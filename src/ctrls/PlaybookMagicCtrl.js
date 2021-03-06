const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires Controller - parent controller 
 */
const Controller = require('./Controller');

/**
 * @requires Models
 */
const QuestionInputModel = require('../models/menus/QuestionInputModel');

/**
 * @requires Services 
 * @param ValidationService - Validate github URL 
 */
const ValidationService = require('../services/utils/ValidationService');
const NodeGitService = require('../services/nodegit/NodeGitService');
const PlaybookApiService = require('../services/PlaybookApiService');

 /**
 * Playbook Magic handler 
 * 
 * @api /playbook/magic
 * @calledby router 
 *
 * @class PlaybookMagicCtrl
 * @extends {Controller}
 */
class PlaybookMagicCtrl extends Controller {

    constructor()
    {
        super();
    }

    /**
     * @name convertGit2Playbook
     * @description Creates a playbook from the commit history of a git repo
     * @param args - arg[3] is optional and should be the repo we read from
     * @param {string} args[1] - 'playbook'
     * @param {string} args[2] - 'magic'
     * @param {string} args[3] - 'http://github.com/user/repo' 
     */
    async convertGit2Playbook(args)
    {
        let appAndBlueprintFolderPaths;
        let blueprintRepoData;
        try
        {   
            /**
             * @step 1. Get the user repo if not yet provided or the url is not a valid github url
             */
            let githubUrl = args[3];
            let githubAppTag;
            let blueprintGithubUrl = args[4];
            let blueprintTag; // -- Semver formatted string
            let blueprintBranchName = "draft/"; // -- draft/{blueprintTag}

            let addedSSHToKeychainAnswer = await inquirer.prompt({
                type : "confirm",
                name : "addedSSHToKeychain",
                message : chalk.black.bgYellow("Ensure you have the passphrase for ~/.ssh/id_rsa set in keychain using 'ssh-add -K ~/.ssh/id_rsa' or ensure you the owner/part of the github blueprint repo")
            })

            if (addedSSHToKeychainAnswer.addedSSHToKeychain)
            {
                // -- Prompt for the app github URL if it has not been provided
                if (!githubUrl || !ValidationService.isGithubUrl(githubUrl))
                {
                    let githubUrlAnswer = await inquirer.prompt({
                        type : "input",
                        name : "githubUrl",
                        default: "https://github.com/Domnom/nodegit-tester",
                        message: "What github repo would you like to convert?",
                        validate: (val)=>{
                            return ValidationService.isGithubUrl(val) ? true: 'Please enter a valid github URL';
                        },
                    })

                    githubUrl = githubUrlAnswer.githubUrl;
                }

                // -- Prompt for the app tag to use. The app tag does not need to follow semver rules because 
                //    we should allow a user to pull the data from any location (Doesn't handle branches just yet, either assumes its master or tag)
                let githubAppTagAnswer = await inquirer.prompt({
                    type : "input",
                    name : "githubAppTag",
                    default: "master",
                    message : "Which tag would you like from this app?"
                })

                githubAppTag = githubAppTagAnswer.githubAppTag != "" ? githubAppTagAnswer.githubAppTag : "master";

                if (!blueprintGithubUrl || !ValidationService.isGithubUrl(githubUrl))
                {
                    let blueprintGithubUrlAnswer = await inquirer.prompt({
                        type : "input",
                        name : "blueprintGithubUrl",
                        default: "https://github.com/Domnom/test-blueprint",
                        message: "What github repo would you like to save the blueprints to?",
                        validate: (val)=>{
                            return ValidationService.isGithubUrl(val) ? true: 'Please enter a valid github URL';
                        },
                    })

                    blueprintGithubUrl = blueprintGithubUrlAnswer.blueprintGithubUrl;
                }

                // -- Prompt for a name for the blueprint branch. The blueprint must follow semver rules to allow
                //    easy, dynamic sorting in masterclass
                


                let blueprintTagAnswer = await inquirer.prompt({
                    type : "input",
                    name : "blueprintTag",
                    default : !!ValidationService.checkAndGetSemver(githubAppTag) ? githubAppTagAnswer : '1.0.0',
                    message : "Please provide a version name (semver) to save the blueprint data to",
                    validate: (val) => {
                        return !!ValidationService.checkAndGetSemver(val) ? true : "Please enter a semver valid name";
                    }
                })

                // -- Because this needs to be a branch (and to prevent multiple refs when tagging) we will prepend with "prerelease/"
                blueprintTag = blueprintTagAnswer.blueprintTag;
                blueprintBranchName += blueprintTag;


                if (githubUrl && blueprintGithubUrl)
                {
                    /**
                     * @step 2. Prepare app and blueprint folder paths and cleanup any old mess
                     */
                    appAndBlueprintFolderPaths = NodeGitService.prepareAppAndBlueprintFolderPaths(githubUrl, blueprintGithubUrl);

                    /**
                     * @step 3. Create or clone a git repo to store/update the blueprints 
                     */
                    blueprintRepoData = await NodeGitService.createOrCloneBlueprintRepoFromGithubUrl((blueprintGithubUrl ? blueprintGithubUrl : githubUrl), appAndBlueprintFolderPaths.blueprintFolderPath);

                    /**
                     * @step 4. Check if the given blueprintBranchName already exists and if the user wants to continue with auto generating if it exists
                     */
                    let branchExistsInRemote = await NodeGitService.doesBranchAlreadyExistInRemote(blueprintRepoData.remote, blueprintBranchName);

                    if (branchExistsInRemote)
                    {
                        let continueWithMagicCommandAnswer = await inquirer.prompt({
                            type : "confirm",
                            name : "continueWithMagicCommand",
                            message : chalk.black.bgYellow("The blueprint branch '" + blueprintBranchName + "' already exists!  Would you like to overwrite the branch?")
                        })

                        if (!continueWithMagicCommandAnswer.continueWithMagicCommand)
                        {
                            process.stdout.write("Aborting magic command. You can view the existing branch at " + (blueprintRepoData.isInit ? blueprintGithubUrl : PlaybookApiService.createGithubUrl(blueprintGithubUrl, blueprintBranchName)) + "\n");
                            return;
                        }
                    }
                    /**
                     * @step 5. Create and checkout the blueprint branch
                     */
                    blueprintRepoData.branch = await NodeGitService.createAndCheckoutBranch(blueprintRepoData.repo, blueprintBranchName);

                    /**
                     * @step 6. Refresh repo index to proceed with auto-generating and adding files
                     */
                    blueprintRepoData.index = await blueprintRepoData.repo.refreshIndex();

                    if (blueprintRepoData)
                    {
                        /**
                         * @step 4. Create the blueprints folder with the github URL
                         */
                        blueprintRepoData = await NodeGitService.createBlueprintsFolderFromGithubUrl(githubUrl, githubAppTag, blueprintRepoData, appAndBlueprintFolderPaths.appFolderPath);

                        /**
                         * @step 5. Ask if we want to build the playbook.json
                         */
                        let buildPlaybookJsonFileAnswer = await inquirer.prompt({
                            type : "confirm",
                            name : "buildPlaybookJsonFile",
                            message : "Would you like to generate the playbook.json file?"
                        })

                        const buildPlaybookJsonFile = buildPlaybookJsonFileAnswer.buildPlaybookJsonFile

                        if (buildPlaybookJsonFile)
                        {
                            global.playbook = require('../playbook.sdk').playbook;
                            global.step = require('../playbook.sdk').step;
                            await PlaybookApiService.buildPlaybookJsonFromGithub(blueprintGithubUrl, blueprintRepoData);
                        }
                        else
                        {
                            process.stderr.write("\nIf you would like to generate the playbook.json then run the command 'playbook build'\n")
                        }

                        /**
                         * @step 6. Push blueprint repo
                         */
                        await NodeGitService.pushRepo(blueprintRepoData.repo, 
                                                    undefined,
                                                    blueprintRepoData.branch,
                                                    blueprintRepoData.branch,
                                                    blueprintRepoData.isInit);

                        /**
                         * @step 7. Attempt to fetch the playbook data from playbook microervice using a combination of author and playbookName.
                         *          If there is a change then prompt user if they confirm to updated data
                         */
                        let existingPlaybookEntryArray = await PlaybookApiService.getPlaybookEntry(appAndBlueprintFolderPaths.playbookName, appAndBlueprintFolderPaths.authour);
                        
                        if (existingPlaybookEntryArray.length != 0)
                        {
                            let existingPlaybookEntry = existingPlaybookEntryArray[0];

                            let promptUserForUpdate = false;
                            let updateMessage = chalk`\n\nAn existing playbook entry was found! Would you like to update the following properties {red.bold FROM} => {green.bold TO}:`;
                            let appDifferenceMessage = chalk`{red.bold ${existingPlaybookEntry.app_url}} => {green.bold ${githubUrl}}`;
                            let blueprintDifferenceMessage = chalk`{red.bold ${existingPlaybookEntry.blueprint_url}} => {green.bold ${blueprintGithubUrl}}`;
                            let updateData = {};

                            // -- Check if the blueprint_url and app_url are the same as the existing playbook entry. If they are then we do not need to update, otherwise prompt for update choice
                            if (existingPlaybookEntry.app_url != githubUrl)
                            {
                                updateMessage += "\n" + appDifferenceMessage;
                                updateData.app_url = githubUrl;
                                promptUserForUpdate = true;
                            }
                            if (existingPlaybookEntry.blueprint_url != blueprintGithubUrl)
                            {
                                updateMessage += "\n" + blueprintDifferenceMessage;
                                updateData.blueprint_url = blueprintGithubUrl;
                                updateData.blueprint_playbook = null;
                                promptUserForUpdate = true;
                            }

                            if (promptUserForUpdate)
                            {
                                let updatePlaybookEntryAnswer = await inquirer.prompt({
                                    type : "confirm",
                                    name : "updatePlaybookEntry",
                                    message : updateMessage
                                })

                                if (updatePlaybookEntryAnswer.updatePlaybookEntry)
                                {
                                    await PlaybookApiService.updatePlaybookEntry(
                                        existingPlaybookEntry._id,
                                        updateData
                                    )
                                }
                            }
                        }
                        else
                        {
                            /**
                             * @step 8. Post the new playbook.json file to the playbook microservice
                             */
                            await PlaybookApiService.createPlaybookEntry(
                                appAndBlueprintFolderPaths.playbookName, 
                                appAndBlueprintFolderPaths.authour,
                                githubUrl, 
                                blueprintGithubUrl,
                                blueprintTag,
                                githubAppTag,
                                blueprintBranchName
                            )
                        }

                        

                        process.stdout.write("\n============ Processing complete ============\n\n")
                        process.stdout.write(`You can view your blueprints at the branch "${blueprintRepoData.isInit ? "master" : blueprintRepoData.branch}" found in the repo:\n`["green"]);
                        process.stdout.write((blueprintRepoData.isInit ? blueprintGithubUrl : PlaybookApiService.createGithubUrl(blueprintGithubUrl, blueprintRepoData.branch) + "\n")["yellow"]);
                        process.stdout.write("\n")
                        process.stdout.write("You can preview the blueprint in masterclass found at:\n"["green"]);
                        process.stdout.write(PlaybookApiService.createMasterclassUrl(appAndBlueprintFolderPaths.authour, appAndBlueprintFolderPaths.playbookName))
                        process.stdout.write("\n=============================================\n\n")
                    }
                }
            }
            else
            {
                process.stderr.write("\nPlease add your ssh and password to keychain by running `ssh-add -K ~/.ssh/id_rsa` to continue\n\n");
            }
        }
        catch(err)
        {
            process.stderr.write("\n-------- An error occurred! --------\n\n"["red"]);
            if (typeof err == "object")
            {
                console.error(JSON.stringify(err, null, 4));
            }
            else
            {
                console.error(err);
            }
            
            process.stderr.write("\n------------------------------------\n"["red"]);
        }
        finally
        {
            if (appAndBlueprintFolderPaths && appAndBlueprintFolderPaths.blueprintFolderPath)
            {
                /**
                 * @step 7. Cleanup blueprint folder
                 */
                // this.deleteFolder(appAndBlueprintFolderPaths.blueprintFolderPath);  
            }
            
        }
        
        return;
    }

}

module.exports = new PlaybookMagicCtrl();