---
title: "Basics OF VXLAN EVPN IN NDFC"
description: "This document serves as a guide for basic configuration of the Data Center VXLAN EVPN fabric type in Nexus Dashboard Fabric Controller (NDFC)."
---

## About This Document

This document serves as a guide for basic configuration of the Data Center VXLAN EVPN fabric type in Nexus Dashboard Fabric Controller (NDFC).

**Prerequisites**:
- Nexus Dashboard (ND) node with the NDFC deployment mode.
	- [[Installing ND v3.2.x on ESXI]]
- CML or EVE-NG running at-least 3-4 Nexus 9000v switches.
	- Mgmt0 interfaces of N9Kv devices must be reachable via NDFCs Mgmt or Fabric interfaces.
- Switches discovered and added to a fabric of type Data Center VXLAN EVPN.
	- [[Getting Started with NDFC]]
- Switches with roles assigned as at-least 2 Leafs and 2 Spines.
	- [[Getting Started with NDFC]]

This guide uses version **Nexus Dashboard 3.2(1i)** and the latest NDFC version.

**Instructions will be indicated bellow the associated screenshot.**

### Environment

![[Basic VXLAN EVPN DNFC Details.png]]
### Objective

The goal of this guide is to configure an NDFC Fabric of type Data Center VXLAN EVPN to have 2 VLANs using VXLAN EVPN, with Multicast and Anycast Gateways.
- "Crossing Boundaries" (VLAN 10) - 192.51.100.0/24
- "Integrated Experiences" (VLAN 20) - 203.0.113.0/24

By the end of this guide, hosts will be connected to port "Ethernet 1/3" on all leafs, and with the following network allocation:
- Host-1 <> N9Kv-4 (VLAN 10)
- Host-2 <> N9Kv-5 (VLAN 20)
- Host-3 <> N9Kv-6 (VLAN 10)
- Host-4 <> N9Kv-7 (VLAN 20)

These hosts within the same subnet should be able to ping eachother without the use of Anycast Gateways, then should be able to use the Anycast Gateways for inter-vlan routing, to ping hosts in other subnets.

## Method of Procedure

0. **Prerequisites**
To get started, make sure that the Ethernet1/3 interfaces are in the `no shutdown` state. Then connect the hosts, and ensure that the port state becomes `up`.

2. **Interface Groups**
First we are going to create two Interface Groups, each of which will act as Access Ports for their associated VLANs.

2. **Fabric VRF**
Then as a prerequisite to creating the Networks, we start by creating our Fabric VRF which will contain all the in-band fabric VXLAN traffic networks.

3. **Networks**
Lastly we can create the networks (VLANs), assign the VLAN IDs, VNIDs, VRF, Anycast Gateway addresses, and names. Then once created, they can be Attached to the relevant leafs, associating them to the Interface Groups.

## Prerequisites

*Connect end hosts to the Ethernet1/3 interface of each leaf on CML or EVE-NG.*

> For this demo, IOSv routers will be used as hosts, for the ease of configuration.

Navigate to the Fabric you will be working in via **Manage > Fabrics > \[FABRIC] > Interfaces**.

![[ND NDFC Basics Interfaces Up.png]]

Click into the "**Filter by attributes**" search bar, then enter the query `Interface == Ethernet1/3` to search for all interfaces with the name "Ethernet1/3".

Ensure that the relevant switches have that interface as `Up` and `Up`, meaning that the host is successfully connected to the interface.

![[ND NDFC Basics Down No Shut.png]]

*In the above example, the port is `Admin Status = Up` so performing `no shut` will have no affect.*

If the interfaces are in an `Admin Status = Down` then you must select that interface via the **checkbox**, then select the **Actions** drop-down, then choose "**No Shutdown**", then **Deploy**.

If the interfaces are in an `Oper. Status = Down` and `Admin Status = Up` then something is wrong with your end host setup, as the interface is ready to come up.

## Interface Groups

> An interface group consists of multiple interfaces with the same attributes. You can create an interface group that allows grouping of host-facing interfaces at a fabric-level. Specifically, you can create an interface group for physical Ethernet interfaces, Layer 2 port-channels, and VPCs. 

### Creating the Groups

Navigate to the **Interface Groups** tab of the Fabric screen via **Fabric > Interface Groups**.

![[ND NDFC Basics Create Interface Group 1.png]]

Select from the **Actions** drop-down on the table the "**Create interface group**" option.

![[ND NDFC Basics Create Interface Group 2.png]]
Here since these ports need to act as Access Ports, and policy templates for access ports are not supported, using the Native VLAN on a trunk port will serve the same purpose.

When done customizing the interface settings, click the "**Create**" button at the bottom right.

![[ND NDFC Basics Created Interface Groups.png]]

**Repeat this step for both networks specified.**

### Adding Member Interfaces

Navigate to the **Interfaces** tab of the Fabric screen via **Fabric > Interfaces**.

Click into the "**Filter by attributes**" search bar, then enter the query `Interface == Ethernet1/3` to search for all interfaces with the name "Ethernet1/3".

![[ND NDFC Basics Add To Interface Group 1.png]]

Select the **checkboxes** next to the **interfaces** you what to add to the **Interface Group** per network.

Then select the **Actions** drop-down on the table, then hover over **More**, then select the "**Add to Interface Group**" option.

![[ND NDFC Basics Add To Interface Group 2.png]]
Select which **Interface Group** you want the interfaces to be members of, then click the "**Save**" button at the bottom right.

**Repeat this step for both sets of interfaces specified.**

![[ND NDFC Basics Verify Interface Groups Members.png]]

You can verify that the interfaces are now members of the associated Interface Groups by navigating back to the Interface Groups tab, then viewing the Interfaces column.

## Fabric VRF

> When creating a Network (next section), one of the requirements is to specify a non-default VRF, so users are to create a Fabric VRF for VXLAN traffic.

Navigate to the **Interfaces** tab of the Fabric screen via **Fabric > Interfaces**.

![[ND NDFC Basics Create Fabric VRF.png]]

Select the **Actions** drop-down at the top right of the table, then select the "**Create**" option.

![[ND NDFC Basics Create VRF Details.png]]
Now enter the VRF name in the "**VRF Name**" field, then make sure to leave the VLAN ID field empty.

When done, click the "**Create**" button at the bottom right.

## Networks

Navigate to the **Networks** tab of the Fabric screen via **Fabric > Networks**.

![[ND NDFC Basics Create Network 1.png]]

Select from the top right table **Action** drop-down the "**Create**" option.

### Layer 2 Only

> Per the requirements in the Objectives section, hosts must be able to ping eachother without an Anycast Gateway, so for now, we will be configuring a "Layer 2 only" network, until next step.

![[ND NDFC Basics Create Network L2.png]]
Enter the following information in the fields:
- **Network Name**: display name of this object
- **Layer 2 only**: enabled
- **Network ID**: same as VLAN ID
- **VLAN ID**: required VLAN ID
- **General Parameters > VLAN Name**: name of the VLAN

> *Notice that with the "**Layer 2 only**" field selected, the **VRF** field is no longer required. This means that even if you enter **Anycast Gateway** information, it will not function.*

When complete, click the "**Create**" button at the bottom right.

**Repeat this step for both VLANs needed.**

### Attaching Networks

Navigate to the **Networks** tab of the Fabric screen via **Fabric > Networks**.

![[ND NDFC Basics Attach Network To Interface Group 1.png]]

Select the **Actions** drop-down from the top right of the table, and select the "**Add to Interface Group**" option.

Then select the **Interface Group** applicable, then click the "**Save**" button at the bottom right.

![[ND NDFC Basics Attaching Networks To Interface Groups 2.png]]

#### Deploying Changes

Select the **Actions** drop-down at the very top bar of the Fabric Screen and select "**Recalculate and Deploy**". Go through the process of deploying these changes. For instruction on this, reference [[Getting Started with NDFC]].

For the demo environment, the **Pending Config** is as follows for N9Kv-6:
```
interface ethernet1/3
  switchport
  switchport mode trunk
  mtu 9216
  spanning-tree bpduguard enable
  spanning-tree port type edge trunk
  switchport trunk native vlan 10
  no shutdown
  switchport trunk allowed vlan 10
vlan 10
  vn-segment 10
  name Crossing_Boundaries
configure terminal
interface nve1
  member vni 10
    mcast-group 239.1.1.1
evpn
  vni 10 l2
    rd auto
    route-target import auto
    route-target export auto
configure terminal
```

*From this output, you can see that the interface will be functioning as a sudo-access port on the correct VLAN, the VLAN is being propagated into VXLAN via Multicast, and the NVE is being advertised.*

#### Testing with Hosts

Log onto each host and assign the following IP Addresses:
- **Host-1**: 192.51.100.10/24
- **Host-2**: 203.0.113.10/24
- **Host-3**: 192.51.100.20/24
- **Host-4**: 203.0.113.20/24

If you are using IOSv routers like in this demo environment, you can use the following commands to configure the hosts:
```
enable
configure terminal
hostname Host-1
interface GigabitEthernet 0/0
  ip address 192.51.100.10 255.255.255.0
  no shutdown
ip route 0.0.0.0 0.0.0.0 192.51.100.1
```

*Note that the default route will not work, or need to be used until Layer 3 Network testing.*

Now test the fabrics configuration by attempting to ping between Host-1 and Host-3:
```
Host-1# ping 192.51.100.20
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.51.100.20, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 3/6/10 ms
```

### Layer 3 Mode

> Per the requirements in the Objectives section, hosts must be able to ping hosts in other subnets using an Anycast Gateway, so now that we have tested Layer 2 configs, we will be configuring a non-"Layer 2 only" network now.

Navigate to the **Networks** tab of the Fabric screen via **Fabric > Networks**.

![[ND NDFC Basics Post Push Networks.png]]

Check the **checkbox** next to a network, then select the **Actions** drop-down from the top right of the table, then select the "**Edit**" option. 

![[ND NDFC Basics Layer 2 Network Creation.png]]

Uncheck the "**Layer 2 only**" field, then select the "**VRF Name**" as the one configured in previous steps.

Now enter the associated networks Anycast Gateway IP address in the "**IPv4 Gateway/NetMask**" field.

When complete, click the "**Save**" button at the bottom right.

#### Deploying Changes

![[ND NDFC Basics L3 New Network Deployment.png]]

*Excuse the typo in the IPv4 Gateway for VLAN 20, it should be 203.0.113.1/24.*

Now that the networks are Layer 3, have their Anycast Gateways assigned, select the **Actions** drop-down at the very top bar of the Fabric Screen and select "**Recalculate and Deploy**". Go through the process of deploying these changes. For instruction on this, reference [[Getting Started with NDFC]].

#### Testing with Hosts

Now test the fabrics configuration by attempting to ping between Host-1 and its DFGW:
```
Host-1# ping 192.51.100.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.51.100.20, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 3/6/10 ms
!
Host-1#ping 203.0.113.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 203.0.113.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 3/4/6 ms
```
Here we can see that Host-1 is now able to not only ping other devices on its subnet, but use its default gateway to contact devices in other subnets.

This concludes the guide.