---
title: Featured Engineering Projects & Case Studies
description: In-depth technical case studies across enterprise network simulation, security labs, virtualization, and server migration.
---

Explore hands-on technical projects, network topologies, and security engineering case studies built across Cisco IOS/IOS-XE/NX-OS, VMware, Linux, and Cloud environments.

---

## 🛠️ Project Case Studies

### 1. 🛡️ Enterprise Network Security & Defense Lab (NET-577)

A full enterprise network security hardening project implementing defense-in-depth across Layer 2 and Layer 3 infrastructure.

```
[ Edge Router / ASA ] ──► [ Core Switch (CoPP / ACLs) ] ──► [ Access Layer (DAI / IPSG / DHCP Snooping) ]
                                    │
                         [ Syslog / SIEM Server ]
```

<div class="quick-stats">
  <div class="stat-item">
    <div class="stat-number">100%</div>
    <div class="stat-label">L2 Protection Enabled</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">25+</div>
    <div class="stat-label">Hardened ACL Rules</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">Zero</div>
    <div class="stat-label">Unauthenticated VTY Access</div>
  </div>
</div>

#### Key Implementations:
* **Control Plane Policing (CoPP):** Policy-maps rate-limiting ICMP, BGP, OSPF, and SSH to protect the route processor against DoS attacks.
* **Layer 2 Protection Fabric:** Deployed Dynamic ARP Inspection (DAI), IP Source Guard (IPSG), DHCP Snooping with Option 82, and BPDU Guard across all access ports.
* **AAA & Role-Based Access Control:** Configured TACACS+/RADIUS server groups with local failback privilege levels.
* **GitHub Repository:** [MarcusNguyen105/Network-Security---NET-577](https://github.com/MarcusNguyen105/Network-Security---NET-577)

---

### 2. 🌐 Multi-Area Enterprise Network Simulation

Large-scale enterprise routing topology simulation designed for high availability, fast convergence, and path redundancy.

```
            ┌─────────────── [ Area 0 Backbone ] ───────────────┐
            │                                                   │
  [ Area 10 - DC West ]                               [ Area 20 - DC East ]
  (OSPFv3 + BGP Multi-Path)                           (OSPFv3 + BGP Multi-Path)
            │                                                   │
  [ Access / Server VLANs ]                           [ Access / Server VLANs ]
```

<div class="quick-stats">
  <div class="stat-item">
    <div class="stat-number">&lt; 1s</div>
    <div class="stat-label">BFD Failover Time</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">4-Way</div>
    <div class="stat-label">ECMP Load Balancing</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">99.999%</div>
    <div class="stat-label">Simulated Reliability</div>
  </div>
</div>

#### Key Implementations:
* **Hierarchical Routing Architecture:** Multi-area OSPFv2/OSPFv3 core with BGP exterior routing and route summarization at ABR/ASBR boundaries.
* **High Availability & First-Hop Redundancy:** HSRP/VRRP with IP SLA tracking and Rapid Spanning Tree (RSTP / 802.1w).
* **Virtual Port Channels & LACP:** Port-channel bundling across dual-homed access switches to eliminate STP blocked ports.
* **GitHub Repository:** [MarcusNguyen105/Network-Simulation](https://github.com/MarcusNguyen105/Network-Simulation)

---

### 3. 🖥️ Home Lab & Enterprise Virtualization Series

Multi-node virtualization cluster simulating datacenter routing, container workloads, and network automation.

<div class="quick-stats">
  <div class="stat-item">
    <div class="stat-number">3-Node</div>
    <div class="stat-label">Proxmox / ESXi Cluster</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">10G</div>
    <div class="stat-label">SFP+ Storage Network</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">15+</div>
    <div class="stat-label">Segmented VLANs</div>
  </div>
</div>

#### Key Implementations:
* **Virtual Switching & SDN:** VMware vSphere Standard/Distributed Switches, Cisco Nexus 9000v virtual switches, and pfSense firewall routing.
* **Network Automation:** Python/Netmiko scripts and Ansible playbooks automating configuration backups, VLAN provisioning, and interface audits.
* **Storage & SAN:** TrueNAS Core ZFS storage over dedicated 10GbE iSCSI / NFS networks with jumbo frames (MTU 9000).
* **GitHub Repository:** [MarcusNguyen105/Home-Lab-series](https://github.com/MarcusNguyen105/Home-Lab-series)

---

### 4. 🔄 Enterprise Server & Active Directory Migration

Zero-downtime infrastructure migration covering directory services, DNS/DHCP consolidation, and hybrid-cloud integration.

#### Key Implementations:
* **Active Directory Migration:** Forest functional level upgrade, FSMO role transfer, and cross-forest trust establishment.
* **Automated DHCP/DNS Failover:** Load-sharing DHCP split-scopes with 80/20 redundancy and dynamic DNS update security.
* **GitHub Repository:** [MarcusNguyen105/Server-Migration](https://github.com/MarcusNguyen105/Server-Migration)

---

### 5. 🎯 Web Security & Penetration Testing CTF Labs

Security vulnerability analysis, offensive CTF write-ups, and remediation blueprints based on the OWASP Top 10.

* **GitHub Repository:** [MarcusNguyen105/Web-Security-CTF](https://github.com/MarcusNguyen105/Web-Security-CTF)
