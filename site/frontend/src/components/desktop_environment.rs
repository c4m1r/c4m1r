use dioxus::prelude::*;
use crate::components::taskbar::TaskBar;
use crate::components::desktop::Desktop;
use crate::windows::window_manager::WindowManager;
use crate::windows::window_renderer::WindowRenderer;

#[component]
pub fn DesktopEnvironment() -> Element {
    use_context_provider(|| Signal::new(WindowManager::new()));

    rsx! {
        div {
            style: "width: 100vw; height: 100vh; overflow: hidden; display: flex; flex-direction: column; background-image: url('/assets/wallpapers/bliss.jpg'); background-size: cover; background-position: center;",
            
            div {
                style: "flex: 1; position: relative; width: 100%; height: 100%;",
                Desktop { path: "/C:/Documents and Settings/User/Desktop".to_string() }
                WindowRenderer {} 
            }
            
            TaskBar { height: 30 }
        }
    }
}
