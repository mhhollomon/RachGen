# RAndom CHord GENerator

[https://mhhollomon.github.io/RachGen/](https://mhhollomon.github.io/RachGen/)

A random chord and progression generator.

- Generates a list of chords based on options you provide.
- Lets you tweak the list including
    - editing individual chords
    - "Rolling the dice" for a new chord.
    - Locking chords you like
- List to individual chords or the entire list
- Download midi for the chords.

## Latest change log

### Add Chords
- You can add a new chord to the top of list. It will always start out as the tonic, root position chord for the key you are in.
However, it will immediately pop up the edit window to allow you to change that.

### Edit
- You can edit more parts of the chord 
- It is now disabled if the chord is locked

### Delete
- You can delete a chord
- It is disabled if the chord is locked

### Replace Chord
- You can now generate a new chord for a single line without having to lock all the others.
However, unlike the locks, it does not honor the duplicates control and will happily give you
a duplicate (or the same chord if you're really unlucky).
- It is disabled if the chord is locked.


### Custom Chords
When editing there is now a new "Custom" tab that will let you take control and use exactly the notes you want.
Thanks to @Gdaddy  for suggesting this feature.
Please consider this experimental and do let me know if you stumble across a bug.
Note : The tab you are on makes a difference when you hit the check button to apply your changes.
If you are on the custom tab, you will get a custom chord, if you are on the "Standard" tab, you will get a standard chord. 