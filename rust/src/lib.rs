use console_error_panic_hook::set_once;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(str: &str);
}

macro_rules! log {
    ($($t:tt)*) => (
        log(&format!($($t)*).to_string());
    )
}

#[wasm_bindgen(start)]
fn main() {
    set_once();
    log!("working!");
}
