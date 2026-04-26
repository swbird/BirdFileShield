import Foundation

@Observable
class AppSettings {
    var securityEnabled: Bool {
        didSet { UserDefaults.standard.set(securityEnabled, forKey: "securityEnabled") }
    }
    var includeFolders: Bool {
        didSet { UserDefaults.standard.set(includeFolders, forKey: "includeFolders") }
    }

    init() {
        self.securityEnabled = UserDefaults.standard.bool(forKey: "securityEnabled")
        self.includeFolders = UserDefaults.standard.bool(forKey: "includeFolders")
    }
}
