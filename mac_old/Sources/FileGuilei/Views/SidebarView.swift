import SwiftUI

struct SidebarView: View {
    @Binding var selectedPage: AppViewModel.SidebarPage

    var body: some View {
        List(AppViewModel.SidebarPage.allCases, selection: $selectedPage) { page in
            Label(page.label, systemImage: page.icon)
                .tag(page)
        }
        .listStyle(.sidebar)
    }
}
