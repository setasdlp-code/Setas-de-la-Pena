import SwiftUI
import FirebaseCore

@main
struct FirebaseUIApp: App {
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        TabView {
            NavigationStack { CamarasView() }
                .tabItem { Label("Cámaras", systemImage: "thermometer") }

            NavigationStack { IncidenciasView() }
                .tabItem { Label("Incidencias", systemImage: "exclamationmark.triangle") }

            NavigationStack { LotesProduccionView() }
                .tabItem { Label("Lotes", systemImage: "shippingbox") }

            NavigationStack { BitacoraView() }
                .tabItem { Label("Bitácora", systemImage: "book") }

            NavigationStack { RecetasView() }
                .tabItem { Label("Recetas", systemImage: "list.bullet.rectangle") }
        }
    }
}
