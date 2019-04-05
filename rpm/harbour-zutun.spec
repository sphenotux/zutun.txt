# 
# Do NOT Edit the Auto-generated Part!
# Generated by: spectacle version 0.27
# 

Name:       harbour-zutun

# >> macros
# << macros

%{!?qtc_qmake:%define qtc_qmake %qmake}
%{!?qtc_qmake5:%define qtc_qmake5 %qmake5}
%{!?qtc_make:%define qtc_make make}
%{?qtc_builddir:%define _builddir %qtc_builddir}
Summary:    todo.txt GUI
Version:    1.7.2
Release:    1
Group:      Applications/Productivity
License:    BSD
BuildArch:  noarch
URL:        https://github.com/fuchsmich/zutun.txt
Source0:    %{name}-%{version}.tar.bz2
Source100:  harbour-zutun.yaml
Requires:   sailfishsilica-qt5 >= 0.10.9
Requires:   libsailfishapp-launcher
Requires:   pyotherside-qml-plugin-python3-qt5
Requires:   sailfish-components-pickers-qt5
BuildRequires:  pkgconfig(sailfishapp) >= 1.0.3
BuildRequires:  pkgconfig(Qt5Core)
BuildRequires:  pkgconfig(Qt5Qml)
BuildRequires:  pkgconfig(Qt5Quick)
BuildRequires:  qt5-qttools-linguist
BuildRequires:  desktop-file-utils

%description
A Sailfish GUI for todo.txt formatted tasklists

%prep
%setup -q -n %{name}-%{version}

# >> setup
# << setup

%build
# >> build pre
# << build pre

%qtc_qmake5 

%qtc_make %{?_smp_mflags}

# >> build post
# << build post

%install
rm -rf %{buildroot}
# >> install pre
# << install pre
%qmake5_install

# >> install post
#install -d %{buildroot}%{_datadir}/lipstick/quickactions
#install %{_builddir}/../zutun.txt/quickaction.conf %{buildroot}%{_datadir}/lipstick/quickactions/info.fuxl.zutuntxt.conf
install -d %{buildroot}%{_datadir}/jolla-settings/entries/
install %{_builddir}/../zutun.txt/shortcut.conf %{buildroot}%{_datadir}/jolla-settings/entries/info.fuxl.zutuntxt.json
echo %{version}-%{release} > %{buildroot}%{_datadir}/%{name}/version
# << install post

desktop-file-install --delete-original       \
  --dir %{buildroot}%{_datadir}/applications             \
   %{buildroot}%{_datadir}/applications/*.desktop

%files
%defattr(-,root,root,-)
%defattr(0644,root,root,-)
%{_datadir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{_datadir}/icons/hicolor/*/apps/%{name}.png
# >> files
%{_datadir}/lipstick/quickactions/info.fuxl.zutuntxt.conf
%{_datadir}/jolla-settings/entries/info.fuxl.zutuntxt.json
# << files
