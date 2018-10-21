
// const simplex = require('simplex-noise');
const range = (start, end, scl) => {
  const emp = (end - start);
  let r = [];
  for (i = start; i <= end; i += emp / scl) { r.push(i); }
  return r;
}
const get3dDistance = ({ fx, fy, fz }, { tx, ty, tz }) => {
  var dx = Math.pow((fx - tx), 2);
  var dy = Math.pow((fy - ty), 2);
  var dz = Math.pow((fz - tz), 2);
  return Math.sqrt(dx + dy + dz);
}
const pi = Math.PI;
function* roundTripFromTo({ start, end, nbTurns }) {
  console.log('{ start, end, nbTurns }', { start, end, nbTurns });
  console.log(`c'est parti pour ${((end - start) * 2 * nbTurns) - 1} coups`)
  let index = start;
  let turns = 0;
  let forward = true;
  let finished = false;
  console.log('{end, index, turns, forward}', { end, index, turns, forward });
  while (!finished) {
    if (forward) {
      yield index++;
      if (index >= end) {
        forward = false;
      }
    } else { // backward
      yield index--;
      if (index <= start) {
        if (turns++ >= nbTurns) {
          finished = true;
          return
        }
        forward = true;
      }
    }
  }
}
// settings
let r = 2;
let scl = 15;

// functions
const numToHex = (num) => `${Math.floor(num).toString(16).length == 1 ? 0 : ''}${parseInt(Number(num)).toString(16)}`
let el = ({ x, y, z, rad, color, rx, ry, perlin, j }) => {

  // if (!color) {
  //   const h = numToHex(j * 255 / lvl_scl);
  //   // const h = numToHex(i * 255 / scl * 2);
  //   // console.log(i, h);
  //   // const h = numToHex(Math.floor(perlin * 255));
  //   color = `#${h}${h}${h}`;
  // }

  e = document.createElement('a-entity');
  e.setAttribute('geometry', {
    primitive: 'box',
    height: .25,
    width: .25,
    depth: .005,
    // radius: rad
  });

  if (rx !== undefined && ry !== undefined) {
    e.setAttribute('rotation',
      { x: rx, y: ry }
    );
    // e.setAttribute('text', {
    //   value: `rx: ${rx}, \n ry: ${ry}`,
    //   zOffset: .005,
    //   align: 'center',
    //   width: .2
    // });
  }
  e.setAttribute('material', 'color', color || perlin * 255);
  e.setAttribute('position', { x, y, z });
  return e;
}

let main = document.getElementById('main-scene');

const latLonRailToPosRot = ({ lat, lon, r }) => {
  const rx = -(lon * 180 / pi) - 90;
  const ry = -(lat * 180 / pi) - 90;

  const x = r * Math.sin(lon) * Math.cos(lat);
  const z = r * Math.sin(lon) * Math.sin(lat);
  const y = r * Math.cos(lon);

  return { x, y, z, rx, ry };
}

// on ready
document.addEventListener("DOMContentLoaded", () => {

  main.appendChild(el({ x: 0, y: 0, z: 0, rad: .2, color: 'grey' }));
  main.appendChild(el({ x: .5, y: 0, z: 0, rad: .2, color: 'red' }));
  main.appendChild(el({ x: 0, y: .5, z: 0, rad: .2, color: 'blue' }));
  main.appendChild(el({ x: 0, y: 0, z: .5, rad: .2, color: 'green' }));

  const perlin = new SimplexNoise();
  const allLon = [...range(-pi, pi, scl * 2)];
  // const allLat = [...range(-pi / 2, pi / 2, scl)];
  const lvl_scl = roundTripFromTo({ start: 4, end: 11, nbTurns: 4 })

  for (let i = 0; i < scl * 2; i++) {
    const lon = allLon[i];
    if (i === 0 || i === scl) {
      i !== 0 ? lvl_scl.next().value : null;
      const lat = range(-pi / 2, pi / 2, scl)[scl];
      main.appendChild(el({
        rad: .1,
        color: 'grey',
        ...latLonRailToPosRot({ lat, lon, r })
      }));
    } else {
      jscl = lvl_scl.next().value;
      // jscl = scl;
      console.log('jscl', jscl);
      const allLat = range(-pi / 2, pi / 2, jscl);
      for (let j = 0; j < jscl; j++) {
        let lat = allLat[j];
        const pos = latLonRailToPosRot({ lat, lon, r });
        const { x, y, z } = pos;
        n = perlin.noise3D(x, y, z);

        main.appendChild(el({
          rad: .2,
          perlin: n,
          ...pos,
          j,
          color: i % 2 == 0 ? 'red' : 'blue',
        }));
      }
    }
  }
});