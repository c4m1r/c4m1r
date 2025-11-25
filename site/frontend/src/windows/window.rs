use dioxus::prelude::*;
use crate::windows::meta_window::MetaWindow;
use crate::windows::window_manager::WindowManager;

#[component]
pub fn Window(window: MetaWindow) -> Element {
    let rect = window.rect.read();
    let mut window_manager = use_context::<Signal<WindowManager>>();
    let id = window.id;
    
    rsx! {
        div {
            style: "position: absolute; left: {rect.left}px; top: {rect.top}px; width: {rect.width}px; height: {rect.height}px; background: white; border: 1px solid black; display: flex; flex-direction: column; box-shadow: 2px 2px 5px rgba(0,0,0,0.3);",
            
            // Title Bar
            div {
                style: "height: 25px; background: #000080; color: white; display: flex; align-items: center; padding: 0 5px; cursor: default;",
                onmousedown: move |_| {
                    // TODO: Implement dragging
                    window_manager.write().bring_to_front(id);
                },
                
                span { style: "flex: 1; font-weight: bold; font-size: 12px;", "{window.title}" }
                
                // Controls
                div {
                    style: "display: flex; gap: 2px;",
                    button { onclick: move |_| window.is_minimized.set(true), "_" }
                    button { onclick: move |_| {
                        let current = *window.is_maximized.read();
                        window.is_maximized.set(!current);
                    }, "[]" }
                    button { onclick: move |_| window_manager.write().destroy(id), "X" }
                }
            }
            
            // Content
            div {
                style: "flex: 1; overflow: auto; position: relative;",
                {window.body}
            }
        }
    }
}
