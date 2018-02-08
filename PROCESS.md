# Process-book

## Week 1

__Day 1:__  
* Visualized the idea through rough sketches.
* Chose GitHub repositories as the main subject.
* Decided to specificly focus on repository growth out of interest and perhaps usefulness for future projects.
* (See README.md for the initial sketches, thoughts and project proposal).

__Day 2:__  
* Received a GO for my project proposal.
* Chose to section my page in 3 sections, 2 divs for HTML/Bootstrap elements, and space for the SVG between the both.
  * A reason for this is that I wanted the user to NOT have to scroll or move around the screen, instead having everything readily available.
  * As such, the svg updates on certain events, changing between views and visualisations.

__Day 3:__  
* Added sub svg's on the growth analysis overview, thought it would give me more freedom to work with the data and control over svg sizes etc.
* Started working with the GitHub API and struggling to make the async Fetch() calls managable.

__Day 4:__  
* Decided to use callbacks to make async more managable, still seems to give problems, wondering if using await for functions might work better.
* Using seperate screen_wipe(); function to fade out between SVG updates, adding a `smooth` effect.
* Added callback section to screen_wipe(); to make any new visualisation wait for the wipe. Doesn't seem to work consistently yet?

__Day 5:__  
* Decided to actually start on the growth visualisations (Shaded line chart & Bar Chart), wondering how to present the data since the dates are irregular.


## Week 2

__Day 1:__  
* Had major issues with asynchronous data fetching again
  * Decided to use an async const and await it to try and make sure it all follows synchonous order.
  * Wondering if I should just do away with the previous callback and replace with awaits.
  
__Day 2:__  
* Decided against a shaded linechart, opting for a normal linechart instead.
  * Found shaded linechart might obscure visibility and not neccesarily contribute to it due to the scale of the data
  
__Day 3:__  
* Noticed commit data always returns as 52 weeks, even if 80% of said weeks are empty
  * Wondering wether to let the data stay as is, or to slice it. Keeping it as is for now, as it shows how long a person HASN'T worked on it.
* Linechart doing fine, deciding for sure now that it won't be a shaded linechart. Adding space between the red/green line for fear of them overlapping.


__Day 4:__  
* Thinking about the structure visualisation, will most likely have to make a multitude of fetch(api); calls which will most definately hit the rate limit.
  * Options:
    * Make a different visualisation
    * Remove slider
    * Somehow fetch data without going over the rate limit?
  * To be decided.
  
__Day 5:__  
* Got feedback from presentation, thinking of only fetching data when the user releases the slider, but still dynamicly changing the date shown when sliding.
* Decided to change data set, slicing up till the first commit and again from the last commit.

## Week 3

__Day 1:__  
* Finished the codeflower, decided this definately also needs a zoom function of sorts, since some repositories are just huge.
  * (Try the following repository: "discord.net")  
  
__Day 2:__  
* Changed codeflower opacity on text and circle
  * When hovering over with the mouse, circles no longer get a higher opacity value
  * Text belonging to the hovered-over node becomes more visisble
* Decided on above changes because switching between opacity on "all" objects caused stuttering in the visualisation as it was applied every single tick.  
__Day 3:__   
* Sick.  
__Day 4:__  
* Sick.  
__Day 5:__  
* Sick.  
