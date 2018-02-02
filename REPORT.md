# REPORT

## Description

This visualisation illustrated several interesting statistics concerning github repositories, 
aiming to make the current (rate of) growth visible.

![search results](https://github.com/LunarLite/GithubVisualisation/blob/master/doc/Screen_application.png?raw=true?raw=true)

## Technical degisn - Code

There is only one .js file.  

The main functions contained in this .js file are as follows:  
* initVisualisation()
  * Creates the base SVG and basic components utilitize wipeScreen()
* wipeScreen()
  * Slowly fades out all items in the base SVG, removes them, and re-initilizes the basic components.
* searchRepository()
  * Using the search query the user gave, it searches the github API and returns said results to searchResults().
* searchResults()
  * Checks the validity of given results (checks for a ratelimit!) and limits the amount of results to 10 before sending them to addResults()
* addResults()
  * Adds the results to the parent Svg, accompanied by relevant information and fades them in one by one.
* setData()
  * Once a given result is chosen by the user, setData retrieves all required data from the chosen repository, 
  * has the data manipulated into shape by formStructure() and calls growthVisualistion() when done.
* formStructure()
  * Makes sure that the structure of the force-directed graph is properly built and contains all neccesary data.
* structureVisualisation()
  * Clears the screen using wipeScreen() and creates the force-directed graph.
* growthVisualisation()
  * Clears the screen using wipeScreen() and creates the bar-chart and line-graph.
* initializeSlider()
  * Links the slider from index.html to the .js file and makes sure it only works while the user is looking at the force-directed graph.

The supporting functions per main function contained in the .js file are as follows:  
* initVisualisation()/WipeScreen
  * changeTitle()
    * Changes the title component for every visualisation
  * shiftImageOut()
    * Makes the github logo dissapear
  * shiftImageIn()
    * Makes the github logo appear
* structureVisualisation()
  * getFileType()
    * Retrieves the file type for each file of the force-directed graph
  * getFileName()
    * Retrieves the file name for each file of the force-directed graph
  * createLegend()
    * Creates a legend for the force-directed graph with colours based on the file types
* growthVisualisation()
  * addCodeDescript()
    * Adds a basic description of the line-graph
  * addCommitDescript()
    * Adds a basic description of the bar-chart
  * getTopValue()
    * Gets the highest value of the code-frequency data
  * getBotValue()
    * Gets the lowest value of the code-frequency data

## Challenges

Challenges I've met been met with during the process:
* The github API ratelimiting me quite quickly, this was mostly an issue when utilizing the slider for the force-directed graph.
  * solved by making the slider only update the actualy graph-data when released.
* Combining Asynchronous/Synchronous code (due to using fetch-calls for the API) clashing.
  * Solved through async functions using the await prefix and the use of const's.
* Being ill for almost a week, so ill in fact that I ended up missing 5 days worth of time to work on my project.
  * Working hard through the night and hoping I did the best I could.

All in all I'm happy with the way it turned out, the only thing I'd like to change if I had the time, 
would be to finetune or find the error in my fetch calls.
They seem to work 90% of the time, but every so often they just return `undefined` for no evident reason.
I deemed this a technical glitch, perhaps an issue with the API, or a form of minor ratelimitting due to making calls to the API too quickly.
As such, I've chosen to neglect it for now, focus on the visualisations and to check on it if there's time left.


