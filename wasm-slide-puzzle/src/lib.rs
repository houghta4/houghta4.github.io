use js_sys::{Array, Math::random};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str); // binds to js function

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn table(v: Vec<i32>);
}

#[wasm_bindgen]
pub fn is_solved(v: Vec<i32>) -> bool {
    !v.iter().enumerate().any(|(i, &e)| e != i as i32)
}

#[wasm_bindgen]
pub fn shuffle(v: Vec<usize>, size: usize) -> Array {
    if v.len() <= 1 {
        return v.into_iter().map(JsValue::from).collect();
    }
    let mut coords: Vec<(usize, i32, i32)> = v
        .iter()
        .enumerate()
        .map(|(index, &value)| (value, (index / size) as i32, (index % size) as i32))
        .collect();
    let mut empty_i: usize = v.len() - 1;
    for _ in 0..300 {
        let empty = coords[empty_i];
        let mut dr = empty.1;
        let mut dc = empty.2;

        if random() <= 0.5 {
            // move rows
            if random() <= 0.5 {
                dr += 1;
            } else {
                dr -= 1;
            }
        } else {
            // move cols
            if random() <= 0.5 {
                dc += 1;
            } else {
                dc -= 1;
            }
        }
        let i: usize = (dr * size as i32 + dc) as usize;
        if i < coords.len()
            && i != empty_i
            && valid_move(
                coords[i].1,
                coords[i].2,
                coords[empty_i].1,
                coords[empty_i].2,
            )
        {
            // swap indices and switch empty_i
            let tmp = coords[empty_i];
            coords[empty_i].0 = coords[i].0;
            coords[i].0 = tmp.0;
            empty_i = i;
        }
    }
    coords
        .iter()
        .map(|&(first, _, _)| JsValue::from(first))
        .collect()
}

fn valid_move(tile_x: i32, tile_y: i32, target_x: i32, target_y: i32) -> bool {
    let x_valid = (tile_x == target_x - 1) || (tile_x == target_x + 1);
    let y_valid = (tile_y == target_y - 1) || (tile_y == target_y + 1);
    (tile_x == target_x || tile_y == target_y) && (x_valid || y_valid)
}

#[cfg(test)]
mod tests {
    use crate::*;

    #[test]
    fn test_is_solved() {
        assert_eq!(is_solved(vec![0, 1, 2, 3, 4]), true);
        assert_eq!(is_solved(vec![0, 2, 3, 4]), false);
    }

    #[test]
    fn test_valid_move() {
        assert_eq!(valid_move(0, 0, 1, 0), true);
        assert_eq!(valid_move(0, 0, 2, 0), false);
    }
}
