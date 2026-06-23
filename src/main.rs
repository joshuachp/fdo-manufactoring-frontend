use std::net::IpAddr;
use std::sync::Arc;

use axum::Router;
use axum::http::StatusCode;
use axum::routing::get;
use clap::Parser;
use eyre::Context;
use tokio::net::TcpListener;
use tokio::signal::unix::SignalKind;
use tracing::info;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

#[derive(Debug, clap::Parser)]
#[clap(version)]
struct Cli {
    /// Address to listen on
    #[arg(long, default_value = "127.0.0.1")]
    address: IpAddr,
    /// Port to listen on
    #[arg(long, default_value = "9000")]
    port: u16,
}

struct AppState {}

async fn fallback() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "Page not found")
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let cli = Cli::parse();

    color_eyre::install()?;

    tracing_subscriber::registry()
        .with(tracing_error::ErrorLayer::default())
        .with(tracing_subscriber::fmt::layer())
        .try_init()?;

    let listener = TcpListener::bind((cli.address, cli.port))
        .await
        .wrap_err("couldn't bind server address and port")?;

    let addr = listener.local_addr()?;

    info!("started listening on http://{addr}");

    let router = Router::new()
        .fallback(get(fallback))
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .with_state(Arc::new(AppState {}));

    axum::serve(listener, router)
        .with_graceful_shutdown(signal()?)
        .await?;

    Ok(())
}

fn signal() -> eyre::Result<impl Future<Output = ()> + Send> {
    let mut int = tokio::signal::unix::signal(SignalKind::interrupt())?;
    let mut term = tokio::signal::unix::signal(SignalKind::terminate())?;

    Ok(async move {
        tokio::select! {
            _ = int.recv() => {
                info!("SIGINT received exiting");
            }
            _ = term.recv() => {
                info!("SIGTERM received exiting");
            }
        }
    })
}
