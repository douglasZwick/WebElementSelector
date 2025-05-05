// Contains code that I might use later, but I don't need it for now

javascript:(function()
{
  if (window.__elementSelectorActive) return;
  window.__elementSelectorActive = true;

  const highlightBox = document.createElement('div');
  Object.assign(highlightBox.style,
  {
    position: 'absolute',
    pointerEvents: 'none',
    border: '2px solid red',
    background: 'rgba(255,255,0,0.2)',
    zIndex: 999999,
    transition: 'all 0.05s ease-out'
  });
  document.body.appendChild(highlightBox);

  let currentEl = null;

  function UpdateHighlightBox(el)
  {
    const rect = el.getBoundingClientRect();
    Object.assign(highlightBox.style,
    {
      top: rect.top + window.scrollY + 'px',
      left: rect.left + window.scrollX + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px'
    });
  }

  function OnMouseMove(e)
  {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el !== currentEl && el !== highlightBox)
    {
      currentEl = el;
      UpdateHighlightBox(el);
    }
  }

  function EatEvent(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }

  function OnClick(e)
  {
    EatEvent(e);
    Cleanup();

    const el = currentEl;
    if (el)
    {
      el.style.outline = '3px dashed red';
      console.log("Selected element:", el);
      ProcessElement(el);
    }
  }

  function OnKeyDown(e)
  {
    if (e.key === 'Escape')
    {
      e.preventDefault();
      e.stopImmediatePropagation();
      Cleanup();
      console.log("Element selection cancelled.");
    }
  }

  function Cleanup()
  {
    window.removeEventListener('mousemove', OnMouseMove, true);
    window.removeEventListener('click', OnClick, true);
    window.removeEventListener('mousedown', EatEvent, true);
    window.removeEventListener('mouseup', EatEvent, true);
    window.removeEventListener('pointerdown', EatEvent, true);
    window.removeEventListener('pointerup', EatEvent, true);
    window.removeEventListener('keydown', OnKeyDown, true);
    highlightBox.remove();
    window.__elementSelectorActive = false;
  }

  function ProcessElement(el)
  {
    // TODO: Implement your logic here
  }

  window.addEventListener('mousemove', OnMouseMove, true);
  window.addEventListener('click', OnClick, true);
  window.addEventListener('mousedown', EatEvent, true);
  window.addEventListener('mouseup', EatEvent, true);
  window.addEventListener('pointerdown', EatEvent, true);
  window.addEventListener('pointerup', EatEvent, true);
  window.addEventListener('keydown', OnKeyDown, true);
})();
