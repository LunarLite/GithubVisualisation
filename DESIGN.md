# Design Document

## Data sources:

The GithubV3 API will provide all data neccesary.  
[Github API](https://developer.github.com/v3/)  
[Github API statistic documentation](https://developer.github.com/v3/repos/statistics/)  

No need to filter or transform.  
All data is retrieved from the API in JSON format.  
After fetching all matching repositories, only the chosen one will be passed into the visualisation.  
The JSON repository object features links with which to fetch commit/statistical data and history.

## Diagram

![Simple_Diagram](https://github.com/LunarLite/GithubVisualisation/blob/master/doc/Simple_diagram.png?raw=true)


## API's and/or d3 plugins

[Github API](https://developer.github.com/v3/)  


