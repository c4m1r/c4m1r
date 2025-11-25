#[derive(Clone, Copy, Debug, PartialEq, Default)]
pub struct Rectangle {
    pub left: i32,
    pub top: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Clone, Copy, Debug, PartialEq, Default)]
pub struct Size {
    pub width: i32,
    pub height: i32,
}
