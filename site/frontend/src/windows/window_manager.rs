use dioxus::prelude::*;
use crate::windows::meta_window::MetaWindow;
use std::collections::HashMap;

#[derive(Clone, Copy)]
pub struct WindowManager {
    pub windows: Signal<Vec<MetaWindow>>,
    pub next_id: Signal<usize>,
}

impl WindowManager {
    pub fn new() -> Self {
        Self {
            windows: Signal::new(Vec::new()),
            next_id: Signal::new(0),
        }
    }

    pub fn create(&mut self, title: String, body: Element) -> MetaWindow {
        let id = *self.next_id.read();
        *self.next_id.write() += 1;
        
        let window = MetaWindow::new(id, title, body);
        self.windows.write().push(window.clone());
        window
    }

    pub fn destroy(&mut self, id: usize) {
        self.windows.write().retain(|w| w.id != id);
    }

    pub fn minimize(&mut self, id: usize) {
        let window = self.windows.read().iter().find(|w| w.id == id).cloned();
        if let Some(window) = window {
            window.is_minimized.set(true);
        }
    }

    pub fn restore(&mut self, id: usize) {
        let window = self.windows.read().iter().find(|w| w.id == id).cloned();
        if let Some(window) = window {
            window.is_minimized.set(false);
            self.bring_to_front(id);
        }
    }

    pub fn bring_to_front(&mut self, id: usize) {
        let mut windows = self.windows.write();
        if let Some(pos) = windows.iter().position(|w| w.id == id) {
            let window = windows.remove(pos);
            windows.push(window);
        }
    }
    
    // Helper to get focused window (topmost not minimized)
    pub fn get_focused(&self) -> Option<MetaWindow> {
        self.windows.read().iter().rev().find(|w| !*w.is_minimized.read()).cloned()
    }
}
