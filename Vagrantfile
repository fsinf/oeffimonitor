Vagrant.configure("2") do |config|
  config.vm.box = "debian/stretch64"

  config.vm.provider "virtualbox" do |v|
    v.name = "oeffimonitor"
    v.memory = 2048
  end

  config.vm.provider "libvirt" do |v|
    v.memory = 2048

    config.vm.synced_folder ".", "/vagrant", type: "rsync"
  end

  # design-choice: run file in vm.
  config.vm.provision "shell", inline: "/vagrant/vagrant_provision.sh"

  config.vm.network "forwarded_port", adapter: 1, guest: 8080, host: 8080

end
