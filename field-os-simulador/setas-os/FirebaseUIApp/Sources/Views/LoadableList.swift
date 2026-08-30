import SwiftUI

// Not LabeledContent — that's iOS 16+, deployment target is 15.0.
struct LabeledRow: View {
    let label: String
    let value: String

    init(_ label: String, value: String) {
        self.label = label
        self.value = value
    }

    var body: some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
                .foregroundStyle(.secondary)
        }
    }
}

// Shared load/error/empty/content states so each screen doesn't repeat the
// same async-loading boilerplate. Errors surface as text, not silently —
// per Setas OS CANON P-01 (verifiability over assumption): a failed fetch
// must be visible to the operator, not swallowed.
struct LoadableList<Item: Identifiable, RowContent: View>: View {
    enum State {
        case loading
        case loaded([Item])
        case failed(String)
    }

    @State private var state: State = .loading
    let emptyMessage: String
    let load: () async throws -> [Item]
    @ViewBuilder let row: (Item) -> RowContent

    var body: some View {
        Group {
            switch state {
            case .loading:
                ProgressView()
            case .failed(let message):
                VStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle")
                        .foregroundStyle(.orange)
                    Text(message)
                        .font(.footnote)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.secondary)
                    Button("Reintentar") { Task { await reload() } }
                }
                .padding()
            case .loaded(let items) where items.isEmpty:
                // Not ContentUnavailableView — that's iOS 17+, deployment target is 15.0.
                VStack(spacing: 8) {
                    Image(systemName: "tray")
                        .font(.largeTitle)
                        .foregroundStyle(.secondary)
                    Text(emptyMessage)
                        .foregroundStyle(.secondary)
                }
                .padding()
            case .loaded(let items):
                List(items) { row($0) }
                    .refreshable { await reload() }
            }
        }
        .task { await reload() }
    }

    private func reload() async {
        do {
            let items = try await load()
            state = .loaded(items)
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}
