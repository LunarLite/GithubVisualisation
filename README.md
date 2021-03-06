[Github Pages](https://lunarlite.github.io/GithubVisualisation/)  
[Youtube Demo](https://youtu.be/IW206Ds3N9Q)

# GithubVisualisation

This visualisation shows important data concerning a chosen Github repository, such as:
* All files
  * Using a codeflower
* Commits
  * Using a barchart
* Code additions/removals
  * Using a shaded line chart
* Actual growth analysis
  * Using x chart (undecided)

### Problem/Solution

There is currently not a clear analytical tool or overview/visualisation of the growth of a repository.
This can be an issue for manaement/group projects, where it's unsure how a project/repository is progressing.

A visualisation would help in this case, because hard data (code, commits, etc.) may be hard to keep track of over a certain period of time. 
Additionally, no clear conclusions can be made without having a clear overview, which a visualisation can provide.

The visualisation will show the addition of files/code/commits at a certain time of choice (during the repositories life-span).
Additionally some sort of analysis will be made of the code frequency and commit data, allowing for another chart.
The visualisation will also make use of the Github v3 API.

### Usage

The user can enter a search query which gets run through the Github API and returns matching repositories.
These repositories get listed in the SVG. 
![search results](https://github.com/LunarLite/GithubVisualisation/blob/master/doc/Screen_search_result.png?raw=true)

The user can then click any of these listed repositories to move on with the visualisation.
The visualisation will show the "structure" screen of the repository by default. 
![structure](https://github.com/LunarLite/GithubVisualisation/blob/master/doc/Screen_structure.png?raw=true)

To switch to the second screen, dubbed "growth analysis" there will be a button at the top right of the svg.
If the user wants to switch back, there is a similar button dubbed "structure".

The second screen (growth analysis), will feature two basic charts showing the amount of commits per week and the addition/removal of code per week.
![growth analysis](https://github.com/LunarLite/GithubVisualisation/blob/master/doc/Screen_growth_analysis.png?raw=true)

A third chart will be added, forming a combination of the data from the other two and representing actual growth.
For now, the type of chart is unsure.
![growth analysis addition](https://github.com/LunarLite/GithubVisualisation/blob/master/doc/Screen_growth_analysis_addition.png?raw=true)

Underneath the SVG there will be a horizontal slider. This slider will dictate which moment of the repositories history you are watching,
allowing the user to view actual changes and growth over time.

### Interactive components

An input box above the SVG will allow the user to query a search for different repositories.

There's a slider underneath the SVG at all times, this slider dictates a moment in the history of a chosen repository.
The view relates to that chosen time.

In the "growth analysis" screen, hovering over any chart will cause highlights with additional data to appear on all charts.  
In the "structure" screen, hovering over a node will show it's file type, size, and creation/last update dates.

There's a button on the top right of both the "growth analysis" and "structure" screen, allowing you to switch between the two.

### External components / Data sources

The GithubV3 API will provide all data neccesary.  
[Github API](https://developer.github.com/v3/)  
[Github API statistic documentation](https://developer.github.com/v3/repos/statistics/)  

The d3-tip library *might* be used.


### This code goes un-copyright-ed, meaning it's free to use for any and everyone.
