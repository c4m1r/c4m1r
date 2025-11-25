use dioxus::prelude::*;
use crate::windows::window_manager::WindowManager;

#[component]
pub fn Desktop(path: String) -> Element {
    let mut window_manager = use_context::<Signal<WindowManager>>();

    rsx! {
        div {
            style: "width: 100%; height: 100%; padding: 10px;",
            // Icons will go here
            div {
                style: "color: white; text-shadow: 1px 1px 1px black;",
                "Desktop Icons Placeholder ({path})"
            }
            
            button {
                onclick: move |_| {
                    window_manager.write().create("Test Window".to_string(), rsx! { div { "Hello World!" } });
                },
                "Open Test Window"
            }
        }
    }
}
