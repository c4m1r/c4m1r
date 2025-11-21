use axum::{
    extract::Path,
    http::StatusCode,
    response::{Html, IntoResponse, Json},
    routing::get,
    Router,
};
use serde_json::json;
use std::fs;
use chrono::Utc;
use std::net::SocketAddr;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    // Build our application with a route
    let app = Router::new()
        .route("/api/config", get(get_config))
        .route("/api/apps", get(get_apps_list))
        .route("/apps/{app}", get(app_handler))
        .fallback_service(ServeDir::new("static"));

    // Run our app with hyper
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("🚀 Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_config() -> Result<Json<serde_json::Value>, StatusCode> {
    match fs::read_to_string("static/config.json") {
        Ok(content) => match serde_json::from_str(&content) {
            Ok(config) => Ok(Json(config)),
            Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        },
        Err(_) => Err(StatusCode::NOT_FOUND),
    }
}

async fn get_apps_list() -> Result<Json<serde_json::Value>, StatusCode> {
    match fs::read_to_string("static/config.json") {
        Ok(content) => match serde_json::from_str::<serde_json::Value>(&content) {
            Ok(config) => {
                if let Some(apps) = config.get("apps") {
                    let mut app_list = Vec::new();
                    if let Some(apps_obj) = apps.as_object() {
                        for (id, app_config) in apps_obj {
                            if let Some(name) = app_config.get("name").and_then(|n| n.as_str()) {
                                if let Some(icon) = app_config.get("icon").and_then(|i| i.as_str()) {
                                    app_list.push(json!({
                                        "id": id,
                                        "name": name,
                                        "icon": icon
                                    }));
                                }
                            }
                        }
                    }
                    Ok(Json(json!({ "apps": app_list })))
                } else {
                    Err(StatusCode::INTERNAL_SERVER_ERROR)
                }
            },
            Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        },
        Err(_) => Err(StatusCode::NOT_FOUND),
    }
}

async fn app_handler(Path(app): Path<String>) -> impl IntoResponse {
    // Check if app exists in config
    match fs::read_to_string("static/config.json") {
        Ok(content) => match serde_json::from_str::<serde_json::Value>(&content) {
            Ok(config) => {
                if let Some(apps) = config.get("apps") {
                    if let Some(apps_obj) = apps.as_object() {
                        if apps_obj.contains_key(&app) {
                            return (StatusCode::OK, format!("App '{}' is available", app));
                        }
                    }
                }
                (StatusCode::NOT_FOUND, format!("App '{}' not found", app))
            },
            Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Configuration error".to_string()),
        },
        Err(_) => (StatusCode::NOT_FOUND, "Configuration not found".to_string()),
    }
}
