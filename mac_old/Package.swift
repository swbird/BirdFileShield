// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "FileGuilei",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(
            name: "FileGuilei",
            path: "Sources/FileGuilei",
            resources: [.copy("Resources/BIP39WordList.txt")],
            linkerSettings: [
                .linkedFramework("AppKit"),
                .linkedFramework("SwiftUI"),
            ]
        ),
        .testTarget(
            name: "FileGuileiTests",
            dependencies: ["FileGuilei"],
            path: "Tests/FileGuileiTests"
        ),
    ]
)
