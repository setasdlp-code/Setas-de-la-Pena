import SwiftUI

// Minimal sparkline Shape — avoids pulling in the Charts framework (iOS
// 16+) since deployment target is 15.0.
struct Sparkline: Shape {
    let values: [Double]

    func path(in rect: CGRect) -> Path {
        guard values.count > 1, let min = values.min(), let max = values.max() else {
            return Path()
        }
        let span = Swift.max(0.1, max - min)
        var path = Path()
        for (i, v) in values.enumerated() {
            let x = rect.width * CGFloat(i) / CGFloat(values.count - 1)
            let y = rect.height * (1 - CGFloat((v - min) / span))
            if i == 0 { path.move(to: CGPoint(x: x, y: y)) }
            else { path.addLine(to: CGPoint(x: x, y: y)) }
        }
        return path
    }
}
