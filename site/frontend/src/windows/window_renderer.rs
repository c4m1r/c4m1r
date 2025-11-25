use dioxus::prelude::*;
use crate::windows::window_manager::WindowManager;
use crate::windows::window::Window;

#[component]
pub fn WindowRenderer() -> Element {
    let window_manager = use_context::<Signal<WindowManager>>();
    let windows = window_manager.read().windows;

    rsx! {
        for window in windows.read().iter() {
            Window { key: "{window.id}", window: window.clone() }
        }
    }
}
