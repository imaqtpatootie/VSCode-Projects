I've learned how to:

margin/padding
    if 0 0 0 0 then top, right, bottom, left
    if 0 0 0 then top, left and right, bottom
    if 0 0 then top and bottom, left and right
    if 0 then all sides

transition
    ease - default
    ease-in - slows down at start
    ease-out - slows down at end
    ease-in-out - slows down at start then normal then slow down again
    transition: 'targetted element' seconds timing (ease, etc.)

box-shadow
    0 0 0 black - x-value, y-value, blur, color

Center
    display: flex;
    justify-content: center;
    align-items: center;
    
    or
    
    display: block;
    text-align: center;
    margin: 0 auto;

adjust image
    background-size: cover;
    background-repeat: no-repeat:

    background-size: contain;
    object-fit: cover;
    object-position: center;

pseudo-elements
    ::after
    ::before
    - use position: relative; on parent and position: absolute; on the ::after or ::before
    - using ::after can create a gradient border

cramp
    min
    ideal
    max
    ex. font-size(2rem, 5vw, 5rem);

justify-content
    center - center all
    flex-start - contents are at the left side
    flex-end - contents are at the right side
    space-around - creates spaces around every children
    space-between - creates space between contens, however it will not create a gap on the sides, just the center

create a responsive navigation from nav-to-sidebar
    create two ul, make the other one display: none; depending on specific @media

---------------------------------------------------
I've learned that: 
    when adding alt on image, be more specific as possible to improve the readability for visually impared users.

    i can create a file specifically for utility like .underline {text-decoration: underline;}, making it reusable.

    .webp is the same as .gif but much lighter.

    i need to name classes or ids as specific as possible for easier understanding for the other collaborators.

    when naming classes, you can add title then description for easier identification when editing. for example, div.gift-wrapper and h2.gift-title

    when an element has fixed width, to center, you use margin: 0 auto;
---------------------------------------------------

Theories

    using flex-direction: row; for navigations






------------------------------------------------------
Javascript
    D-1
        Learned variable
        Basic mathematical operation
        console log
        increments
        function
        event listener
        pass in arguments
        DOM (Document Object Model) - how to use javascript to modify a website
        datatypes
        concatenation
        escape
        plus equal technique
        innerText > textContent

    D-2
        elseIf
    D-3
        boolean
        querySelector
        array
        zero index
        composite data type
        .length
        .push
        .pop