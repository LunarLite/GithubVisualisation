# GithubVisualisation

This visualisation shows important data concerning a chosen Github repository, such as:
* All files
  * Using a codeflower
* Commits
  * Using a barchart
* Code additions/removals
  * Using a shaded line chart (?)
* More?

### Usage

The user can enter a search query which gets run through the Github API and returns matching repositories.
These repositories get listed in the SVG. 
![search results](https://github.com/LunarLite/GithubVisualisation/blob/master/Sketches/Screen_search_result.png?raw=true)

The user can then click any of these listed repositories to move on with the visualisation.
The visualisation will show the "structure" screen of the repository by default. 
![structure](https://github.com/LunarLite/GithubVisualisation/blob/master/Sketches/Screen_structure.png?raw=true)

To switch to the second screen, dubbed "growth analysis" there will be a button at the top right of the svg.
If the user wants to switch back, there is a similar button dubbed "structure".

The second screen (growth analysis), will feature two basic charts showing the amount of commits per week and the addition/removal of code per week.
![growth analysis](https://github.com/LunarLite/GithubVisualisation/blob/master/Sketches/Screen_growth_analysis.png?raw=true)

A third chart will likely be added, forming a combination of the data from the other two and representing actual growth.
For now, the type of chart is unsure.
![growth analysis addition](https://github.com/LunarLite/GithubVisualisation/blob/master/Sketches/Screen_growth_analysis_addition.png?raw=true)

Underneath the SVG there will be a horizontal slider. This slider will dictate which momen of the repositories history you are watching,
allowing the user to view actual changes and growth over time.
