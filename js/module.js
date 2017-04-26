registerController('NetworkingRouteController', ['$api', '$scope', '$timeout', function($api, $scope, $timeout) {
    $scope.restartedDNS = false;
    $scope.routeTable = "";
    $scope.routeInterface = "br-lan";
    $scope.routeInterfaces = [];


    $scope.getRoute = (function(){
        $api.request({
            module: 'Networking',
            action: 'getRoutingTable'
        }, function(response){
            $scope.routeTable = response.routeTable;
            $scope.routeInterfaces = response.routeInterfaces;
        });
    });

    $scope.restartDNS = (function() {
        $api.request({
            module: 'Networking',
            action: 'restartDNS'
        }, function(response) {
            if (response.success === true) {
                $scope.restartedDNS = true;
                $timeout(function(){
                    $scope.restartedDNS = false;
                }, 2000);
            }
        });
    });

    $scope.updateRoute = (function() {
        $api.request({
            module: 'Networking',
            action: 'updateRoute',
            routeIP: $scope.routeIP,
            routeInterface: $scope.routeInterface
        }, function(response) {
            if (response.success === true) {
                $scope.getRoute();
                $scope.updatedRoute = true;
                $timeout(function(){
                    $scope.updatedRoute = false;
                }, 2000);
            }
        });
    });

    $scope.getRoute();

}]);

registerController('NetworkingAccessPointsController', ['$api', '$scope', '$timeout', function($api, $scope, $timeout) {
    $scope.apConfigurationSaved = false;
    $scope.apConfigurationError = "";
    $scope.apConfig = {
        selectedChannel: "1",
        openSSID: "",
        hideOpenAP: false,
        managementSSID: "",
        managementKey: "",
        disableManagementAP: false,
    };

    $scope.saveAPConfiguration = (function() {
        $api.request({
            module: "Networking",
            action: "saveAPConfig",
            apConfig: $scope.apConfig
        }, function(response) {
            if (response.error === undefined) {
                $scope.apConfigurationSaved = true;
                $timeout(function(){
                    $scope.apConfigurationSaved = false;
                }, 6000);
            } else {
                $scope.apConfigurationError = response.error;
                $timeout(function(){
                    $scope.apConfigurationError = "";
                }, 3000);
            }
        })
    });

    $scope.getAPConfiguration = (function() {
        $api.request({
            module: "Networking",
            action: "getAPConfig"
        }, function(response) {
            if (response.error === undefined) {
                $scope.apConfig = response;
                if ($scope.apConfig['selectedChannel'] === true) {
                    $scope.apConfig['selectedChannel'] = "1";
                }
            }
        })
    });

    $scope.getAPConfiguration();
}]);

registerController('NetworkingClientModeController', ['$api', '$scope', '$timeout', function($api, $scope, $timeout) {
    $scope.interfaces = [];
    $scope.selectedInterface = "";
    $scope.accessPoints = [];
    $scope.selectedAP = {};
    $scope.scanning = false;
    $scope.key = "";
    $scope.connected = true;
    $scope.connecting = false;
    $scope.noNetworkFound = false;

    $scope.getInterfaces = (function() {
        $api.request({
            module: 'Networking',
            action: 'getClientInterfaces'
        }, function(response) {
            if (response.error === undefined) {
                $scope.interfaces = response;
                $scope.selectedInterface = $scope.interfaces[0]; 
            }
        });
    });

    $scope.scanForNetworks = (function() {
        $scope.scanning = true;
        $api.request({
            module: 'Networking',
            action: 'scanForNetworks',
            interface: $scope.selectedInterface
        }, function(response) {
            if (response.error !== undefined) {
                $scope.noNetworkFound = true;
            } else {
                $scope.noNetworkFound = false;
                $scope.accessPoints = response;
                $scope.selectedAP = $scope.accessPoints[0];
            }
            $scope.scanning = false;
        });
    });

    $scope.connectToAP = (function() {
        $scope.connecting = true;
        $api.request({
            module: 'Networking',
            action: 'connectToAP',
            interface: $scope.selectedInterface,
            ap: $scope.selectedAP,
            key: $scope.key
        }, function(response) {
            $scope.key = "";
            $timeout(function() {
                $scope.checkConnection();
                $scope.connecting = false;
            }, 10000);
        });
    });

    $scope.checkConnection = (function() {
        $api.request({
            module: 'Networking',
            action: 'checkConnection',
        }, function(response) {
            if (response.error === undefined) {
                if (response.connected) {
                    $scope.connected = true;
                    $scope.connectedInterface = response.interface;
                    $scope.connectedSSID = response.ssid;
                    $scope.connectedIP = response.ip;
                } else {
                    $scope.connected = false;
                    $scope.getInterfaces();
                }
            }
        });
    });

    $scope.disconnect = (function() {
        $scope.disconnecting = true;
        $api.request({
            module: 'Networking',
            action: 'disconnect',
            interface: $scope.connectedInterface
        }, function(response) {
            if (response.error === undefined) {
                $timeout(function() {
                    $scope.getInterfaces();
                    $scope.connected = false;
                    $scope.disconnecting = false;
                    $scope.accessPoints = [];
                }, 10000);
            }
        });
    });

    $scope.checkConnection();

}]);

registerController('NetworkingMACAddressesController', ['$api', '$scope', '$interval', function($api, $scope, $interval) {
    $scope.interfaces = [];
    $scope.selectedInterface = "wlan0";
    $scope.newMac = "";
    $scope.resettingMac = false;

    $scope.getMacData = (function() {
        $api.request({
            module: 'Networking',
            action: 'getMacData'
        }, function(response) {
            if (response.error === undefined) {
                $scope.interfaces = response;
            } 
        });
    });

    $scope.setMac = (function() {
        $api.request({
            module: 'Networking',
            action: 'setMac',
            interface: $scope.selectedInterface,
            mac: $scope.newMac,
        }, function(response) {
            if (response.error === undefined) {
                $scope.getMacData();
                $scope.newMac = "";
            } 
        });
    });

    $scope.setRandomMac = (function() {
        $api.request({
            module: 'Networking',
            action: 'setRandomMac',
            interface: $scope.selectedInterface
        }, function(response) {
            if (response.error === undefined) {
                $scope.getMacData();
                $scope.newMac = "";
            } 
        });
    });

    $scope.resetMac = (function() {
        $api.request({
            module: 'Networking',
            action: 'resetMac',
            interface: $scope.selectedInterface
        }, function(response) {
            if (response.error === undefined) {
                $scope.newMac = "";
                $scope.resettingMac = true;
                $interval(function(){
                    $scope.resettingMac = false;
                    $scope.getMacData();
                }, 7000);
            } 
        });
    });

    $scope.getMacData();
}]);

registerController('NetworkingAdvancedController', ['$api', '$scope', '$timeout', function($api, $scope, $timeout) {
    $scope.hostnameUpdated = false;
    $scope.wirelessReset = false;
    $scope.data = {
        hostname: "Pineapple",
        ifconfig: ""
    };

    $scope.reloadData = (function() {
        $api.request({
            module: 'Networking',
            action: 'getAdvancedData'
        }, function(response) {
            if (response.error === undefined) {
                $scope.data = response;
            }
        });
    });

    $scope.setHostname = (function() {
        $api.request({
            module: "Networking",
            action: "setHostname",
            hostname: $scope.data['hostname']
        }, function(response) {
            if (response.error === undefined) {
                $scope.hostnameUpdated = true;
                $timeout(function(){
                    $scope.hostnameUpdated = false;
                }, 2000);
            }
        });
    });

    $scope.resetWirelessConfig = (function() {
        $api.request({
            module: 'Networking',
            action: 'resetWirelessConfig'
        }, function(response) {
            if (response.error === undefined) {
                $scope.wirelessReset = true;
                $timeout(function(){
                    $scope.wirelessReset = false;
                }, 5000);
            }
        });
    });

    $scope.reloadData();
}]);
