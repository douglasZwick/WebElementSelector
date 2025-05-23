// @ts-check

/** @module WebElementSelector */

class WesData
{
  constructor()
  {
    /** @type {boolean} */
    this.Active = false;
    /** @type {(() => void)[]} */
    this.CleanupFns = [];
  }


  /**
   * 
   * @param {any} maybeWes 
   * @returns {WesData}
   */
  static EnsureValid(maybeWes)
  {
    if (WesData.IsValid(maybeWes))
      return maybeWes;

    return new WesData();
  }


  /**
   * 
   * @param {any} value 
   * @returns {value is WesData}
   */
  static IsValid(value)
  {
    return typeof value === 'object' &&
      value != null &&
      typeof value.Active === 'boolean' &&
      Array.isArray(value.CleanupFns);
  }


  /**
   * 
   * @param {() => void} cleanupFn 
   */
  RegisterCleanup(cleanupFn)
  {
    this.CleanupFns.push(cleanupFn);
  }


  ShutDown()
  {
    for (const cleanupFn of this.CleanupFns)
    {
      try
      { cleanupFn(); }
      catch (e)
      {
        console.warn("Cleanup function failed.\n" + 
          "Function:", cleanupFn, "\n" +
          "Error:", e);
      }
    }

    this.CleanupFns = [];
    this.Active = false;
  }
}


class WesDebug
{
  /** @type {boolean} */
  static #UseDebug = false;


  static EnableLogging()
  {
    WesDebug.#UseDebug = true;
  }


  static DisableLogging()
  {
    WesDebug.#UseDebug = false;
  }


  /**
   * 
   * @returns {boolean}
   */
  static IsEnabled()
  {
    return WesDebug.#UseDebug;
  }


  /**
   * 
   * @param  {...any} args 
   */
  static Log(...args)
  {
    if (!WesDebug.#UseDebug) return;

    console.log(...args);
  }
}


/**
 * @typedef {window & { __WES?: WesData, WesDebug?: typeof WesDebug }} WesWindow
 */

/** @type {WesWindow} */
const win = window;
win.WesDebug = WesDebug;

/** @type {(element: Element) => void} */
let processElement = () => {};

/** @type {HTMLElement | null} */
let highlightBox = null;
/**
 * 
 * @returns {HTMLElement}
 */
function GetHighlightBox()
{
  if (!highlightBox)
    throw new Error("Tried to access the highlightBox before it was created");
  return highlightBox;
}

/** @type {Element | null} */
let currentElement = null;

// Keeps track of where the mouse was located in the latest mousemove event.
// Specifically for use in updates called on scroll.
/** @type {{ x: number, y: number }} */
let latestMousePosition = { x: 0, y: 0 };


/** @type {Partial<CSSStyleDeclaration>} */
const highlightBoxStyle = 
{
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: '2147483647',
  border: '1px solid rgba(255, 255, 0, 0.2)',
  backgroundColor: 'rgba(255, 255, 0, 0.2)',
};


/**
 * Entry point. Called externally
 * @param {(element: Element) => void} callback 
 */
export function StartElementSelector(callback)
{
  if (win.__WES?.Active) return;

  win.__WES = WesData.EnsureValid(win.__WES);
  win.__WES.Active = true;

  win.WesDebug?.Log("WebElementSelector framework activated");

  CallbackSetup(callback);
  CreateHighlightBox();
  ConnectAllEvents();
}


/**
 * 
 * @param {(element: Element) => void} callback 
 */
function CallbackSetup(callback)
{
  processElement = callback;
  RegisterCleanup(() => processElement = () => {});
}


/**
 * 
 */
function CreateHighlightBox()
{
  highlightBox = document.createElement('div');
  Object.assign(highlightBox.style, highlightBoxStyle);
  document.body.appendChild(highlightBox);

  RegisterCleanup(DestroyHighlightBox);
}


/**
 * 
 */
function DestroyHighlightBox()
{
  if (!highlightBox) return;

  document.body.removeChild(highlightBox);
  highlightBox = null;
}


/**
 * 
 */
function ConnectAllEvents()
{
  ConnectEvent('mousemove', OnMouseMove, true);
  ConnectEvent('scroll', OnScroll, true);
  ConnectEvent('click', OnClick, true);
  ConnectEvent('mousedown', EatEvent, true);
  ConnectEvent('mouseup', EatEvent, true);
  ConnectEvent('pointerdown', EatEvent, true);
  ConnectEvent('pointerup', EatEvent, true);
  ConnectEvent('keydown', OnKeyDown, true);
}


/**
 * 
 * @param {keyof WindowEventMap} eventName 
 * @param {(e: any) => void} callback 
 * @param {boolean | AddEventListenerOptions} [options] 
 */
function ConnectEvent(eventName, callback, options)
{
  window.addEventListener(eventName, callback, options);

  RegisterCleanup(() =>
    window.removeEventListener(eventName, callback, options)
  );
}


/**
 * 
 * @param {() => void} cleanupFn 
 */
function RegisterCleanup(cleanupFn)
{
  if (!win.__WES)
    throw new Error("Tried to register a cleanup before WES was initialized");

  win.__WES.RegisterCleanup(cleanupFn);
}


/**
 * 
 * @param {MouseEvent} e 
 */
function OnMouseMove(e)
{
  const x = e.clientX;
  const y = e.clientY;
  latestMousePosition.x = x;
  latestMousePosition.y = y;
  UpdateCurrentElementFromPoint(x, y);
}


/**
 * 
 * @param {number} x 
 * @param {number} y 
 */
function UpdateCurrentElementFromPoint(x, y)
{
  const element = document.elementFromPoint(x, y);

  if (!element) return;
  if (element === currentElement) return;
  if (element === highlightBox) return;

  currentElement = element;
  AdjustBoxToElement(GetHighlightBox(),
    currentElement, win.scrollX, win.scrollY);
}


/**
 * 
 * @param {HTMLElement} box 
 * @param {Element} element 
 *  - A reference element to match the highlight box's dimensions to
 * @param {number} scrollX 
 * @param {number} scrollY 
 */
function AdjustBoxToElement(box, element, scrollX, scrollY)
{
  const rect = element.getBoundingClientRect();
  AdjustBoxToRect(box, rect, scrollX, scrollY);
}


/**
 * 
 * @param {HTMLElement} box 
 * @param {DOMRect} rect 
 * @param {number} scrollX 
 * @param {number} scrollY 
 */
function AdjustBoxToRect(box, rect, scrollX, scrollY)
{
  Object.assign(box.style,
  {
    top: rect.top + scrollY + 'px',
    left: rect.left + scrollX + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
  });
}


/**
 * 
 * @param {Event} e 
 */
function OnScroll(e)
{
  UpdateCurrentElementFromPoint(latestMousePosition.x, latestMousePosition.y);
}


/**
 * 
 * @param {MouseEvent} e 
 */
function OnClick(e)
{
  EatEvent(e);
  UpdateCurrentElementFromPoint(e.clientX, e.clientY);

  if (currentElement != null)
  {
    win.WesDebug?.Log("Selected element:", currentElement);
    processElement(currentElement);
  }

  ShutDown();
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
 * 
 * @param {KeyboardEvent} e 
 */
function OnKeyDown(e)
{
  if (e.key === 'Escape')
  {
    EatEvent(e);
    win.WesDebug?.Log("Canceling element selection");
    ShutDown();
  }
}


/**
 * 
 */
function ShutDown()
{
  if (!win.__WES?.Active) return;

  win.__WES.ShutDown();
  currentElement = null;
}
