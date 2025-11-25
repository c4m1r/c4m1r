#![allow(non_snake_case)]

use dioxus::prelude::*;
use tracing::Level;

fn main() {
    // Init logger
    dioxus_logger::init(Level::INFO).expect("failed to init logger");
    
    launch(App);
}

mod components;
mod windows;
mod utils;

use components::desktop_environment::DesktopEnvironment;

fn App() -> Element {
    rsx! {
        DesktopEnvironment {}
    }
}
