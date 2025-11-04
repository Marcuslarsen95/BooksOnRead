export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export function toggle(e, d = "block"){
    if (!e) return;
    e.classList.toggle(`toggle_${d}`);
    e.classList.toggle('invisible');
}

