# Style guide for the GithubVisualisation

#### Mapping
Make sure all file types are in their own collective folder.

#### Variables
Using CamelCase only.
Declare as much as possible within a specified scope.
Only variables spanning across multiple svg instances may be global.
Make sure to use const variables where there is a need to force the code to run synchronous.


#### Functions
Using snake_case only.
Use callbacks before any re-iteration of an svg instance.

#### D3
Make sure to implement all functions on the root level, but call them hierarchically, using callbacks where needed,
to avoid async errors.

Absolutely avoid static scaling, make everything dynamic based on the main svg's width and height.
