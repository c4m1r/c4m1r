use dioxus::prelude::*;
use crate::windows::window_manager::WindowManager;
use crate::components::start_menu::StartMenu;

#[component]
pub fn TaskBar(height: i32) -> Element {
    let mut window_manager = use_context::<Signal<WindowManager>>();
    let windows = window_manager.read().windows;
    let mut start_menu_open = use_signal(|| false);

    rsx! {
        div {
            style: "height: {height}px; width: 100%; background: linear-gradient(to bottom, #245DDA, #1941A5); display: flex; align-items: center; z-index: 1000; position: relative;",
            
            if *start_menu_open.read() {
                StartMenu {}
            }

            // Start Button
            div {
                style: "width: 100px; height: 100%; background: green; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-style: italic; border-top-right-radius: 10px; cursor: pointer;",
                onclick: move |_| start_menu_open.set(!*start_menu_open.read()),
                "start"
            }
            
            // Taskbar Items
            div {
                style: "flex: 1; display: flex; gap: 2px; padding: 2px; overflow-x: auto;",
                for window in windows.read().iter() {
                    div {
                        style: "width: 150px; background: #3A6EA5; color: white; border: 1px solid white; padding: 2px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
                        onclick: move |_| {
                            if *window.is_minimized.read() {
                                window_manager.write().restore(window.id);
                            } else if window_manager.read().focused.as_ref().map(|w| w.id) == Some(window.id) {
                                window_manager.write().minimize(window.id);
                            } else {
                                window_manager.write().bring_to_front(window.id);
                            }
                        },
                        "{window.title}"
                    }
                }
            }
            
            // Clock (Placeholder)
            div {
                style: "padding: 0 10px; color: white; font-size: 12px;",
                "12:00 PM"
            }
        }
    }
}
