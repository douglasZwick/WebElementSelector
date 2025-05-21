// @ts-check

/**
 * 
 * @param {Function} processElement 
 */
export function StartElementSelector(processElement)
{
  if (window.__WesSelectorActive) return;
  window.__WesSelectorActive = true;

  console.log("WebElementSelector framework activated");

  // Replace this code soon with some other way to get an element
  const dummyElement = document.body;
  processElement(dummyElement);
}


/**
 * 
 */
function CreateHighlightBox()
{

}


/**
 * 
 * @param {HTMLElement} element 
 *  - A reference element to match the highlight box's dimensions to
 */
function UpdateHighlightBox(element)
{

}


/**
 * 
 * @param {MouseEvent} e 
 */
function OnMouseMove(e)
{

}


/**
 * Consumes an event so that the web page doesn't receive it
 * @param {Event} e - The event to be consumed
 */
function EatEvent(e)
{
  e.preventDefault();
  e.stopImmediatePropagation();
  
  return false;
}
