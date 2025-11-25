use axum::{
    routing::get_service,
    Router,
};
use tower_http::services::ServeDir;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Serve the 'frontend/dist' directory
    // We fallback to index.html for SPA routing if a file is not found
    let serve_dir = ServeDir::new("frontend/dist")
        .fallback(ServeDir::new("frontend/dist").append_index_html_on_directories(true));

    let app = Router::new()
        .fallback_service(serve_dir);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
