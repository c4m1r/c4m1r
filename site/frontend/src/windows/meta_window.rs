use dioxus::prelude::*;
use crate::utils::rect::Rectangle;
use crate::utils::rect::Size;

#[derive(Clone, Debug, PartialEq)]
pub struct MetaWindow {
    pub id: usize,
    pub title: Signal<String>,
    pub icon: Signal<Option<String>>,
    pub is_maximized: Signal<bool>,
    pub is_minimized: Signal<bool>,
    pub is_resizable: Signal<bool>,
    pub rect: Signal<Rectangle>,
    pub min_size: Signal<Size>,
    pub max_size: Signal<Size>,
    pub body: Element, 
}

impl MetaWindow {
    pub fn new(id: usize, title: String, body: Element) -> Self {
        Self {
            id,
            title: Signal::new(title),
            icon: Signal::new(None),
            is_maximized: Signal::new(false),
            is_minimized: Signal::new(false),
            is_resizable: Signal::new(true),
            rect: Signal::new(Rectangle { left: 0, top: 0, width: 400, height: 300 }),
            min_size: Signal::new(Size { width: 100, height: 100 }),
            max_size: Signal::new(Size { width: i32::MAX, height: i32::MAX }),
            body,
        }
    }
}
