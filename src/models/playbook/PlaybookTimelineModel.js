/**
 * @requires libs
 */
const chalk = require('chalk');
const loDash = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * @requires Services
 */
// import * as TextService from '../../services/utils/TextService';
const TextService = require('../../services/utils/TextService');



// export class PlaybookWindowSettingsModel
class PlaybookWindowSettingsModel
{
    isMin;
    isNotMin;
    isMax;
    isNotMax;
    isClosed;

    constructor()
    {

    }
    
    position = {
        left : undefined,
        top : undefined
    }
    positionMoving = {
        left : undefined,
        top : undefined,
        right : undefined,
        bottom : undefined
    }
    
    
    dimension = {
        width : undefined,
        height : undefined
    }
    dimensionChanging = {
        width : undefined,
        height : undefined    
    }

    isMin()
    {
        this.isMin = true;
    }

    isNotMin()
    {
        this.isNotMin = true;
    }

    isMax()
    {
        this.isMin = false;
        this.isMax = true;
    }

    isNotMax()
    {
        this.isNotMax = true;
    }

    isClosed()
    {
        this.isClosed = true;
    }

    isOpen()
    {
        this.isClosed = false;
    }

    move(left, top)
    {
        if (left != null)
        {
            this.moveLeft(left);
        }
        if (top != null)
        {
            this.moveTop(top);
        }
    }

    moveLeft(left)
    {
        this.positionMoving.left = left;
    }

    moveRight(right)
    {
        this.positionMoving.right = right;
    }

    moveTop(top)
    {
        this.positionMoving.top = top;
    }

    moveBottom(bottom)
    {
        this.positionMoving.bottom = bottom;
    }

    setPosition(left, top)
    {
        if (left != null)
        {
            this.position.left = left;
        }
        if (top != null)
        {
            this.position.top = top;
        }
    }

    changeDimension(width, height)
    {
        if (width != null)
        {
            this.changeWidth(width);
        }
        if (height != null)
        {
            this.changeHeight(height);
        }
    }

    changeWidth(width)
    {
        this.dimensionChanging.width = width;
    }

    changeHeight(height)
    {
        this.dimensionChanging.height = height;
    }

    setDimension(width, height)
    {
        if (width != null)
        {
            this.dimension.width = width;
        }
        if (height != null)
        {
            this.dimension.height = height;
        }
    }

    printJsContent(indentSize = 5)
    {
        const indent1 = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = "";

        /*
            .isMin
         */
        if (this.isMin != null)
        {
            content += indent1 + ".isMin()\n";
        }
        /*
            .isNotMin
         */
        if (this.isNotMin != null)
        {
            content += indent1 + ".isNotMin()\n";
        }
        /*
            .isMax
         */
        if (this.isMax != null)
        {
            content += indent1 + ".isMax()\n";
        }
        /*
            .isNotMax
         */
        if (this.isNotMax != null)
        {
            content += indent1 + ".isNotMax()\n";
        }
        /*
            .isClosed
         */
        if (this.isClosed != null)
        {
            content += indent1 + ".isClosed()\n";
        }

        /*
            .position
         */
        if (this.position.left != null || this.position.top != null)
        {
            let leftVal;
            let topVal;

            if (this.position.left != null)
            {
                leftVal = TextService.formatToStringOrNum(this.position.left);
            }
            if (this.position.top != null)
            {
                topVal = TextService.formatToStringOrNum(this.position.top);
            }
            content += indent1 + ".setPosition(" + (leftVal != null ? leftVal : "null") + ", " + (topVal != null ? topVal : "null") + ")\n";
        }

        /*
            .move
            .moveLeft
            .moveTop
            .moveRight
            .moveBottom
         */
        if (this.positionMoving.left != null && this.positionMoving.top != null && this.positionMoving.right != null && this.positionMoving.bottom != null)
        {
            let leftVal = TextService.formatToStringOrNum(this.positionMoving.left);
            let topVal = TextService.formatToStringOrNum(this.positionMoving.top);
            let rightVal = TextService.formatToStringOrNum(this.positionMoving.right);
            let bottomVal = TextService.formatToStringOrNum(this.positionMoving.bottom);

            content += indent1 + ".move(" + leftVal + ", " + topVal + ", " + rightVal + ", " + bottomVal + ")\n";
        }
        else
        {
            if (this.positionMoving.left != null)
            {
                content += indent1 + ".moveLeft(" + TextService.formatToStringOrNum(this.positionMoving.left) + ")\n";
            }
            if (this.positionMoving.top != null)
            {
                content += indent1 + ".moveTop(" + TextService.formatToStringOrNum(this.positionMoving.top) + ")\n";
            }
            if (this.positionMoving.right != null)
            {
                content += indent1 + ".moveRight(" + TextService.formatToStringOrNum(this.positionMoving.right) + ")\n";
            }
            if (this.positionMoving.bottom != null)
            {
                content += indent1 + ".moveBottom(" + TextService.formatToStringOrNum(this.positionMoving.bottom) + ")\n";
            }
        }
        
        /*
            .setDimension
         */
        if (this.dimension.width != null || this.dimension.height != null)
        {
            let widthVal;
            let heightVal;

            if (this.dimension.width != null)
            {
                widthVal = TextService.formatToStringOrNum(this.dimension.width);
            }
            if (this.dimension.height != null)
            {
                heightVal = TextService.formatToStringOrNum(this.dimension.height);
            }
            content += indent1 + ".setDimension(" + (widthVal != null ? widthVal : "null") + ", " + (heightVal != null ? heightVal : "null") + ")\n";
        }

        /*
            .changeDimension
            .changeWidth
            .changeHeight
         */
        if (this.dimensionChanging.width != null && this.dimension.height != null)
        {
            let widthVal = TextService.formatToStringOrNum(this.dimensionChanging.width);
            let heightVal = TextService.formatToStringOrNum(this.dimensionChanging.height);

            content += indent1 + ".changeDimension(" + widthVal + ", " + heightVal + ")\n";
        }
        else
        {
            if (this.dimensionChanging.width != null)
            {
                content += indent1 + ".changeWidth(" + TextService.formatToStringOrNum(this.dimensionChanging.width) + ")\n"
            }
            if (this.dimensionChanging.height != null)
            {
                content += indent1 + ".changeHeight(" + TextService.formatToStringOrNum(this.dimensionChanging.height) + ")\n"
            }
        }

        return content;
    }
}

/**
 * Base parent for all timeline based models. This will handle the start and duration section
 *
 * @export
 * @class PlaybookTimelineModel
 */
// export class PlaybookTimelineModel extends PlaybookWindowSettingsModel
class PlaybookTimelineModel extends PlaybookWindowSettingsModel
{
    start;
    duration;
    panel;
    transitions = [];

    /**
     * 
     * @param {number} start - start in ms
     * @param {number} duration - duration in ms
     * @param {'description'|'code'|'test'|'browser'|'audio'|'video'|'terminal'|'partial'} panel - panel category
     */
    constructor(start, duration, panel)
    {
        super();
        this.start = start;
        this.duration = duration;
        this.panel = panel; 
    }

    addTransition(start, end)
    {
        let transition = new PlaybookTimelineTransitionModel(start, end);
        this.transitions.push(transition);

        return transition;
    }

    /**
     * Prints the ".withTime()" portion of a timeline entry which will include the start and duration values
     *
     * @param {number} [indentSize=6]
     * @returns {string}
     * @memberof PlaybookTimelineModel
     */
    printJsContent(indentSize = 6)
    {
        const indent1 = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);
        const indent3 = TextService.indent(indentSize + 2);

        // -- Print window settings
        let content = super.printJsContent(indentSize + 1);

        // -- Print the transitions
        for (var transitionI = 0; transitionI < this.transitions.length; transitionI++)
        {
            const transition = this.transitions[transitionI];

            content += transition.printJsContent(indentSize + 1)
        }

        // -- Append the timeline time
        content += indent2 + '.withTime({\n';
        content += indent3 + '"start" : ' + this.start + ',\n';
        content += indent3 + '"duration" : ' + this.duration + '\n';
        content += indent2 + "})\n";

        return content;
    }
}



// export class PlaybookTimelineTransitionModel extends PlaybookWindowSettingsModel {
class PlaybookTimelineTransitionModel extends PlaybookWindowSettingsModel {

    start;
    end;

    constructor(start, end)
    {
        super();
        if (isNaN(start))
        {
            throw "The transition start time must be a number!";
        }
        if (isNaN(end))
        {
            throw "The transition end time must be a number!";
        }

        this.start = start;
        this.end = end;
    }

    printJsContent(indentSize = 5)
    {
        const indent1 = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = indent1 + ".addTransition(" + this.start + ", " + this.end + ")\n";

        content += super.printJsContent(indentSize + 1);

        return content;
    }

}


// export class PlaybookTimelineDescriptionModel extends PlaybookTimelineModel {
class PlaybookTimelineDescriptionModel extends PlaybookTimelineModel {
    
    filePath;
    title;

    constructor(start, duration, filePath, title)
    {
        super(start, duration, 'description');
        this.filePath = filePath;
        this.title = title;
    }

    contents(cwd){
        try{
            const descriptionFilePath = path.resolve(cwd, this.filePath);
            const contents = fs.readFileSync(descriptionFilePath);
            return contents;
        }
        catch(err){
            throw new Error(chalk.red(`💩 Sorry, but I could not read back the code file. Are you sure the path exists: `)+chalk.green.italic(descriptionFilePath)+chalk.grey.bold(`\n\nHere's the error: \n${err.message}`));
        }
    }

    /**
     * Prints the .addDescriptionFromMdFile entry to a timeline
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookTimelineDescriptionModel
     */
    printJsContent(indentSize = 4)
    {
        const indent = TextService.indent(indentSize);

        let content = indent + '.addDescriptionFromMdFile(path.join(__dirname, "' + this.filePath + '"))\n';

        content += super.printJsContent(indentSize);

        return content;
    }
    
}

// export class PlaybookTimelineCodeModel extends PlaybookTimelineModel {
class PlaybookTimelineCodeModel extends PlaybookTimelineModel {
    
    templateFilePath;
    outputFilePath;
    template_data;
    partialModels = [];
    fullPathToCodeHbsFile;

    constructor(start, duration, templateFilePath, outputFilePath, template_data, fullPathToCodeHbsFile)
    {
        super(start, duration, 'code');

        this.templateFilePath = templateFilePath;
        this.outputFilePath = outputFilePath;
        this.template_data = template_data;
        this.fullPathToCodeHbsFile = fullPathToCodeHbsFile;
    }

    /**
     * @file read the code file
     */
    hbsContents(){
        try{
            const hbsContents = fs.readFileSync(this.fullPathToCodeHbsFile);
            return hbsContents;
        }
        catch(err){
            throw new Error(chalk.red(`💩 Sorry, but I could not read back the code file. Are you sure the path exists: `)+chalk.green.italic(this.fullPathToCodeHbsFile)+chalk.grey.bold(`\n\nHere's the error: \n${err.message}`));
        }
    }
        

    /**
     * Create a PlaybookTimelineCodePartialModel that represents ".withPartial()" in the playbook.js
     *
     * @param {number} start
     * @param {number} duration
     * @param {string} partialId
     * @param {string} templateFilePath
     * @param { {[key]: string} } template_data
     * @param {string} fullPathToCodeHbsFile - full path to partial hbs file
     * @returns {PlaybookTimelineCodePartialModel}
     * @memberof PlaybookTimelineCodeModel
     */
    addPartial(start, duration, partialId, templateFilePath, template_data, fullPathToCodeHbsFile)
    {
        const partialModel = new PlaybookTimelineCodePartialModel(
            start, 
            duration, 
            partialId, 
            templateFilePath, 
            template_data,
            fullPathToCodeHbsFile,
        );
        this.partialModels.push(partialModel);
        return partialModel;
    }
    addPartialModel(partialModel){
        this.partialModels.push(partialModel);
    }
    deletePartialModel(partialModel){
        const partialIndex = this.partialModels
            .findIndex(partial => {
                return partialModel.id === partial.id;
            });
        if(partialIndex === -1){
            return false;
        }
        else{
            this.partialModels.splice(partialIndex, 1);
            return true;
        }
    }

    /**
     * Prints the .addCode entry to a timeline
     *
     * @param {number} [indentSize=5]
     * @returns {string}
     * @memberof PlaybookTimelineCodeModel
     */
    printJsContent(indentSize = 5)
    {
        const indent1 = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = indent1 + '.addCode("' + this.templateFilePath + '", "' + this.outputFilePath + '"';
        
        const lastHbsKey = loDash.findLastKey(this.template_data);

        if (this.template_data && !loDash.isEmpty(this.template_data))
        {
            content += ", {\n";

            for (let hbsKey in this.template_data)
            {
                let hbsData = this.template_data[hbsKey];

                if (hbsKey === lastHbsKey)
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '"\n'
                }
                else
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '",\n'
                }
            }
            
            content += indent1 + '})\n';
        }
        else
        {
            content += ")\n";
        }

        this.partialModels.forEach((partialModel) => {

            content += partialModel.printJsContent(indentSize + 1);

        })

        content += super.printJsContent(indentSize);
        

        return content;
    }
}

/**
 * @class PlaybookTimelineCodePartialModel
 * @extends PlaybookTimelineModel
 */
class PlaybookTimelineCodePartialModel extends PlaybookTimelineModel
{
    partialId;
    templateFilePath;
    template_data;
    fullPathToCodeHbsFile;

    constructor(start, duration, partialId, templateFilePath, template_data, fullPathToCodeHbsFile)
    {
        super(start, duration, 'partial');

        this.partialId = partialId;
        this.templateFilePath = templateFilePath;
        this.compileData = template_data;
        this.fullPathToCodeHbsFile = fullPathToCodeHbsFile;
    }

    /**
     * @file read the code file
     */
    hbsContents(){
        try{
            const hbsContents = fs.readFileSync(this.fullPathToCodeHbsFile);
            return hbsContents;
        }
        catch(err){
            throw new Error(chalk.red(`💩 Sorry, but I could not read back the code file. Are you sure the path exists: `)+chalk.green.italic(this.fullPathToCodeHbsFile)+chalk.grey.bold(`\n\nHere's the error: \n${err.message}`));
        }
    }
    

    /**
     * Prints the .withPartial entry that is a child to the .addCode entry
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookTimelineCodePartialModel
     */
    printJsContent(indentSize = 5)
    {
        const indent1 = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = indent1 + '.withPartial("' + this.partialId + '", "' + this.templateFilePath + '", ' + this.start + ", " + this.duration;

        const lastHbsKey = loDash.findLastKey(this.compileData);
        if (this.compileData && !loDash.isEmpty(this.compileData))
        {
            content += ", {\n";

            for (let hbsKey in this.compileData)
            {
                let hbsData = this.compileData[hbsKey];

                if (hbsKey === lastHbsKey)
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '"\n'
                }
                else
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '",\n'
                }
            }

            content += indent1 + '})\n';
        }
        else
        {
            content += ")\n";
        }

        return content;
    }
}



/**
 * Creates a .addTerminal entry in the playbook.js file. Allows the author to add executable commands to the cli panel in masterclass
 *
 * @export
 * @class PlaybookTimelineTerminalModel
 * @extends {PlaybookTimelineModel}
 */
// export class PlaybookTimelineTerminalModel extends PlaybookTimelineModel {
class PlaybookTimelineTerminalModel extends PlaybookTimelineModel {

    terminalCommandModels = [];

    constructor(start, duration)
    {
        super(start, duration, 'terminal');
    }

    addCommand(command)
    {
        const terminalCommandModel = new PlaybookTimelineTerminalCommandModel(command);

        this.terminalCommandModels.push(terminalCommandModel);

        return terminalCommandModel;
    }

    /**
     * Prints the .addTerminal entry to a timeline
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookTimelineTerminalModel
     */
    printJsContent(indentSize = 4)
    {
        const indent1 = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = indent1 + '.addTerminal()\n';

        this.terminalCommandModels.forEach((terminalCommandModel) => {

            content += terminalCommandModel.printJsContent(indentSize + 1);

        })

        content += super.printJsContent(indentSize);
        
        return content;
    }
}

/**
 * Creates a .withCommand entry in the playbook.js file. This will be a command that is to be executed by the cli panel
 *
 * @export
 * @class PlaybookTimelineTerminalCommandModel
 */
// export class PlaybookTimelineTerminalCommandModel {
class PlaybookTimelineTerminalCommandModel {

    command;

    constructor(command)
    {
        this.command = command;
    }

    /**
     * Prints .withCommand entry as a child to the .addTerminal entry
     *
     * @param {number} [indentSize=5]
     * @returns
     * @memberof PlaybookTimelineTerminalCommandModel
     */
    printJsContent(indentSize = 5)
    {
        const indent1 = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = indent1 + '.withCommand("' + this.command.trim() + '")\n';
        return content;
    }

}

module.exports = {
    PlaybookWindowSettingsModel,
    PlaybookTimelineModel,
    PlaybookTimelineTransitionModel,
    PlaybookTimelineDescriptionModel,
    PlaybookTimelineCodeModel,
    PlaybookTimelineCodePartialModel,
    PlaybookTimelineTerminalModel,
    PlaybookTimelineTerminalCommandModel,
};
