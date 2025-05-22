// @ts-check

/**
 * @typedef  {Object} WesData
 * @property {boolean} [Active]
 */

/**
 * @typedef {window & { __WES?: WesData }} WesWindow
 */

/** @type {WesWindow} */
const win = window;

/**
 * 
 * @param {Function} processElement 
 */
export function StartElementSelector(processElement)
{
  if (win.__WES?.Active) return;

  win.__WES = InitializeWesWindow(win.__WES);
  win.__WES.Active = true;

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


/**
 * TODO: Consider creating an actual WesData class and use its constructor
 *   here instead of what I'm doing now
 * @param {WesData | undefined} wes - The WES data that already exists
 * @returns {WesData} - existing if it's already valid, a new WesData if not
 */
function InitializeWesWindow(wes)
{
  if (IsValidWesData(wes)) return wes;

  return { Active: false };
}


/**
 * 
 * @param {any} value The object to validate
 * @returns {value is WesData} Whether it's a valid WesData
 */
function IsValidWesData(value)
{
  return typeof value === 'object' &&
    value != null &&
    typeof value.Active === 'boolean';
}
