use dioxus::prelude::*;

#[component]
pub fn StartMenu() -> Element {
    rsx! {
        div {
            style: "position: absolute; bottom: 30px; left: 0; width: 250px; height: 400px; background: white; border: 2px solid #000080; border-top-right-radius: 10px; display: flex; flex-direction: column; z-index: 2000; box-shadow: 2px 2px 5px rgba(0,0,0,0.5);",
            
            // Header
            div {
                style: "height: 50px; background: linear-gradient(to right, #245DDA, #1941A5); color: white; display: flex; align-items: center; padding: 10px; font-weight: bold; font-size: 18px; border-top-right-radius: 8px;",
                // User icon placeholder
                div { style: "width: 32px; height: 32px; background: orange; border-radius: 50%; margin-right: 10px; border: 2px solid white;" }
                "User"
            }
            
            // Content
            div {
                style: "flex: 1; display: flex;",
                
                // Left pane (Programs)
                div {
                    style: "flex: 1; background: white; padding: 5px;",
                    div { style: "padding: 5px; hover: { background: #245DDA; color: white; }; cursor: pointer;", "Internet Explorer" }
                    div { style: "padding: 5px; hover: { background: #245DDA; color: white; }; cursor: pointer;", "E-mail" }
                    div { style: "border-top: 1px solid #ccc; margin: 5px 0;" }
                    div { style: "padding: 5px; hover: { background: #245DDA; color: white; }; cursor: pointer;", "Notepad" }
                    div { style: "padding: 5px; hover: { background: #245DDA; color: white; }; cursor: pointer;", "Paint" }
                }
                
                // Right pane (System)
                div {
                    style: "width: 100px; background: #D3E5FA; border-left: 1px solid #95BDE7; padding: 5px;",
                    div { style: "padding: 5px; font-weight: bold; cursor: pointer;", "My Documents" }
                    div { style: "padding: 5px; font-weight: bold; cursor: pointer;", "My Computer" }
                    div { style: "padding: 5px; font-weight: bold; cursor: pointer;", "My Network Places" }
                    div { style: "border-top: 1px solid #95BDE7; margin: 5px 0;" }
                    div { style: "padding: 5px; cursor: pointer;", "Control Panel" }
                }
            }
            
            // Footer
            div {
                style: "height: 40px; background: linear-gradient(to right, #245DDA, #1941A5); display: flex; align-items: center; justify-content: flex-end; padding: 0 10px;",
                div { style: "color: white; cursor: pointer; font-weight: bold;", "Log Off" }
                div { style: "width: 1px; height: 20px; background: white; margin: 0 10px;" }
                div { style: "color: white; cursor: pointer; font-weight: bold;", "Turn Off Computer" }
            }
        }
    }
}
