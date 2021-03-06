[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](http://img.shields.io/npm/v/masterclass-playbook.svg?style=flat)](https://www.npmjs.com/package/masterclass-playbook "View this project on npm")


# Playbook SDK
Playbook is like storybook but for the master class IDE 

### Quick start
```bash
# install globally
npm i -g masterclass-playbook

# OR install locally
yarn add -D masterclass-playbook

# init a simple hello world 
npx playbook init --helloworld
```

This will create a boilerplate `helloworld.playbook.js`

## Example Playbooks 
### Hello World Playbook 
```js
playbook('Title of the playbook')
	.addCategory('Title of the first category')
		.addScene('Title of the First scene')
			.addStep('Say Hello World!')
				.addDescription('Hello World ')
    .write('playbook.hello.json');
```


## Docs
### File History 
#### Playbook construction from git history
`playbook git2playbook`
or `/api/v2/bucket/{bucketId}/file/history?filePath=relative/path/from/bucket?branch=optionalBranchName`

git to playbook will read the git history and scaffold a playbook for you to adjust. 
This includes:

* For each `branch` and each `commit`
We will get a history of changes to the file on each branch over each commit 
This will be displayed as such: 
```js
//fileHistoryModel
{
	// relative from the STORAGE root 
	filePath: "bucket/1/react/", 
	fileName: "HelloCtrl.js", 
	branches: [
		{
			// @param {string} branch - branch name 
			branch: "master",

			isCheckedOut: false,
			isClosed: false, 

			history: [
				{
					// @param {Date} date - date string of when the change was made for ordering 
					date: "yyyy-mm-dd-HH:MM:SS",

					// @param {number} relativeOrder - 1 is the latest, 2 is the second to latest
					relativeOrder: 1, 

					// @param {string} fileContents - file contents for this commit 
					fileContents: "class HelloWorld{\n\tconstructor(){\n\t}\n}",

					changesFromLastCommit: {
						fromCommitId: 'commitSha', 
						fromFileContents:  "class HelloWorld{\n\tconstructor(){}\n}",

						/**
						 * @name IDiffModel
						 * @param {*} diffByChar - difference by character 
						 * @param {*} diffByWord - difference by word 
						 * @param {*} diffByLine - difference by line 
						 * @param {ISxd} sxd - difference as a scaffolder
						 * @param {string} sxd.template - handlebars template of the  from template
						 * @param {[key:string]: string} sxd.data - data to inject into the template to end up with the 'To' file
						 * @param {[key:string]: boolean} sxd.addedOrDeleted - key was added or removed in the resulting 'To' file
						 * @param {string} sxd.shouldEqual - handlebars + data = shoudEqual the 'To' file 
						**/
						diffModel: {
							diffByChar: {},
							diffByWord: {},
							diffByLine: {}, 
							sxd: {
								template: "Hello {{originally}}{{name}}",
								data: {
									originally: ''
									name: 'World'
								},
								addedOrDeleted: {
									originally: false,
									name: true,
								},
								shouldEqual: "Hello World"
							}
						}
					}, 

					// @param {ICommit} commit - Commit model 
					commit: {
						// @param {string} sha - commit ID
						sha: "commitId",
						// @param {string} message - commit ID
						message: "feat(xyz): #123 add something ",
						// @param {ISemanticCommit} semantic: attempt to parse the semantic commit
						semantic: {
							// @param commitType - chore, doc, feature
							commitType: "feature",
							// @param feat - if feature, attpempt to parse shortcode 
							feat: "xyz",
							// @param taskId - regex to find task ID
							taskId: "123"
							// @param message - message without meta data 
							message: "add something"

						} //...eof semantic 
					} // ... eof commit 
				} // ... eof IHistoryModel
			] // ... eof history 

		}//...eof IBranchModel
	] //...eof branches
```


### File diff
* cli `playbook diff --from=path/to/file/one.txt --to=path/to/file/two.txt`
* api `GET /api/v2/diff?fileFrom=path/to/file/one.txt&fileTo=path/to/file/two.txt`
* api `POST /api/v2/diff`
```js
// body 
{
	fileContentsFrom: "class One(){\n\n}",
	fileContentsTo: "class Two(){\n\n}"
}
```

* Javascript interface 
```ts
import {DiffService, IDiffModel} from 'masterclass-playbook'

/**
 * Diff from path uses files already in storage 
 * @param {string} bucket - bucket to start from 
 * @param {string} pathFromFile - relative path from the Bucket to the 'From' file
 * @param {string} pathToFile - relative path from the Bucket to the 'To' file
 * @returns {IDiffModel} diffModel - difference by character, word, and line and the Sxd from to data 
 */
DiffService.diffFromPath(bucket, pathFromFile, pathToFile);


/**
 * Diff from path uses files already in storage 
 * @param {string} pathFromContents - the contents for the 'From' file
 * @param {string} pathToContents - the contents for the 'To' file
 * @returns {IDiffModel} diffModel - difference by character, word, and line and the Sxd from to data 
 */
DiffService.diffFromContents(pathFromContents, pathToContents);

/**
 * This will return the IDiffModel
 * 
 * @name IDiffModel
 * @param {*} diffByChar - difference by character 
 * @param {*} diffByWord - difference by word 
 * @param {*} diffByLine - difference by line 
 * @param {ISxd} sxd - difference as a scaffolder
 * @param {string} sxd.template - handlebars template of the from template
 * @param {[key:string]: string} sxd.data - data to inject into the template to end up with the 'To' file
 * @param {[key:string]: boolean} sxd.addedOrDeleted - key was added or removed in the resulting 'To' file
 * @param {string} sxd.shouldEqual - handlebars + data = shoudEqual the 'To' file 
 **/
const diffModel:IDiffModel = {
	diffByChar: {},
	diffByWord: {},
	diffByLine: {}, 
	sxd: {
		template: "Hello {{originally}}{{name}}",
		data: {
			originally: ''
			name: 'World'
		},
		addedOrDeleted: {
			originally: false,
			name: true,
		},
		shouldEqual: "Hello World"
	}
}
```


### Playbook.js
Start a playbook.js file by using `.playbook(title)`

#### Playbook
#### Child Functions
```javascript
.addCategory("title")
.write("playbook.json")
```

#### Categories
#### Child Functions
```javascript
.addScene(title)
```

#### Scenes
#### Child Functions
```javascript
.addStep(title)
```

#### Steps
#### Child Functions
```javascript
.addDescriptionFromMdFile(filePath)
.addCode(start, duration, templateFilePath, outputFilePath, compileData)
.addCli(start, duration)
```

### Timeline - all
#### Child Functions
```javascript
.withTime(start, duration)

// -- Transitions
.addTransition(start, end)
.isMin()
.isNotMin()
.isMax()
.isNotMax()
.isClosed()
.isOpen()
.move(left, top)
.moveLeft(left)
.moveRight(right)
.moveTop(top)
.moveBottom(bottom)
.setPosition(left, top)
.changeDimension(width, height)
.changeWidth(width)
.changeHeight(height)
.setDimension(width, height)
```

#### Notes
With transitions, the main units are 'px' and '%'. In order to set a transition for a given property (e.g height) then the same unit needs to be used `height = 20% -> height = 35%`. View the below panel models to see the default window setting values + units

### Description
#### Window settings
```javascript
isClosed = false;
top = "0px";
left = "0px";
width = "45%";
height = "100%";
```
#### Child Functions
```javascript

```

### Code
#### Window settings
```javascript
isClosed = false;
top = "0px";
left = "50%";
width = "45%";
height = "80%";
```
#### Child Functions
```javascript
.addPartial(start, duration, partialId, templateFilePath, compileData)
```

### Cli
#### Window settings
```javascript
isClosed = true;
top = "0px";
left = "50%";
width = "45%";
height = "20%";
```
#### Child Functions
```javascript
.addCommand(command)
```