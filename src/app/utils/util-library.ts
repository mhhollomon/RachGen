export function capitalize(s : string) {
    return s.substring(0,1).toUpperCase() + s.substring(1).toLowerCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rotateArray(arr : any[], k : number) : any[] {
    return arr.slice(k).concat(arr.slice(0, k));
}

export function range(start : number, end : number) {
    end = Math.floor(end);
    start = Math.floor(start);
    return Array.from({length: (end - start)}, (v, k) => k + start)
}

export async function  sleep(ms : number)  { return new Promise(r => setTimeout(r, ms)); }

export function stringHash(s : string) : number {
    let hash = 0;
    if (s.length === 0) return hash;
    for (let i = 0; i < s.length; i++) {
        let chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function getInheritedBackgroundColor(el : HTMLElement) : string {
    // get default style for current browser
    const defaultStyle = getDefaultBackground() // typically "rgba(0, 0, 0, 0)"
    
    // get computed color for el
    const backgroundColor = window.getComputedStyle(el).backgroundColor
    
    // if we got a real value, return it
    if (backgroundColor != defaultStyle) return backgroundColor
  
    // if we've reached the top parent el without getting an explicit color, return default
    if (!el.parentElement) return defaultStyle
    
    // otherwise, recurse and try again on parent element
    return getInheritedBackgroundColor(el.parentElement)
  }
  
  function getDefaultBackground() {
    // have to add to the document in order to use getComputedStyle
    const div = document.createElement("div")
    document.head.appendChild(div)
    const bg = window.getComputedStyle(div).backgroundColor
    document.head.removeChild(div)
    return bg
  }