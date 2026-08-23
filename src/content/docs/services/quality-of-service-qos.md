---
title: "Quality OF Service QOS"
description: "Classification can be done through:"
---



Classification can be done through:
- Layer 2
	- CoS
- Layer 3
	- ACL
		- IP Addresses
		- Subnets
		- TCP & UDP
	- IP Precedence
	- DSCP
- Layer >=4
	- NBAR
	- DPI

NBAR (Network Based Aplication Recognition) does deep packet inspecion to look beyond L3 and L4 

CoS -> in 802.1Q tag
ToS -> in the L3 payload header


PCP
0 - best effort (default)
1
2
3 - critical applications (voip uses this for making calls)
4 - video
5 - voice (voip active calls)
6 - internetwork control
7 - network control

Since the CoS (PCP) header is in an 802.1q header, it can only be applied if teh traffic already has an 802.1q header. For example, VOIP devices will add the voice vlan 802.1q tag to its voip traffic with CoS already.

IP Precedence is legacy, and only uses the left 3 bits of the 8 bit field, which is why DSCP uses all but the last two bits (used for other stuff). *Learning the IP Precedence rankings are not needed. Is mostly the same as CoS (PCP).*

DSCP (Differentiated Services Code Point) is a industry agreed uppon set of markings.

- Default Forwarding (DF) - best effort traffic (default)
- Expedited Forwarding (EF) - low loss/latency/jitter traffic (usually voice)
- Assured Forwarding (AF) - A set of 12 standard values, with the goal of making choosing a DSCP value easier.
- Class Selector (CS) - A set of 8 standard values, which line up with the 8 IP Precedence backwards compatible values.

## DF / EF

- DF is used for best effort traffic
- The DSCP marking for DF is 0 (000000xx)
- EF is used for traffic tha requires low loww/latency/jitter.
- The DSCP marking for EF is 46 (101110xx).

## AF

These are juts standardized ways for you to use easy values, and they provide an easy to understand order.

**When you configure AF to classify, it is just a macro that translates to a DSCP value**.

The first 3 bits is the Class, then the 4th and 5th bits are the Drop Precedence.

Higher Class is better.
Lower Drop Prcedence is better.

![[QoS AF Rankings.png]]

You can calculate the DSCP based on the total binary, without splitting it up.

![[QoS AF Calulations.png]]

To quickly calculate the DSCP number from the AF number: `8X + 2Y` where X is the first digit and Y is the second digit.

## CS

Is a set of 8 standard DSCP values, which just so happen to line up with IP Precedence compatibility because the 4th and 5th digit is 0, therefor backwards compatible.

![[QoS CS Calulations.png]]

## RFC 3954 Reccomdendations

- Voice: EF
- Interactice video: AF4x
- Streaming video: AF3x
- High priority data: AF2x
- Best effort: DF

## Scheduling

This is done when you multiple queues, hwo do we determine which one gets to go first?

- First In First Out (FIFO)
- Priority Queueing (PQ)
	- Makes 4 queues each with a different priority.
	- Nonflexible.
- Round Robin (FQ)
	- Taken equally from each queue.
- Weighted Round Robin (WFQ) / HQF (Hierarchical Queuing Framework)
	- Sets each queue to have a priority which will take precedence over lower priorities.
- CBWFQ (Class-Based Weighted Fair Queueing)
	- Designate a certain amount of link bandwidth assured per queue.
	- Uses the Weighted Round Robin system with it, so it also has priorities for the weights.

LLQ (Low Latency Queueing)
- Designates one or more queue as strict priority queues.
- The scheduler will ALWAYS take the traffic from this queue if it has traffic, no matter what.
	- Warning: this could starve the other queues while they wait for LLQ queue.

## Shaping and Policing

Shaping buffers the traffic in a queue, which basically sets the link bandwidth to lower. 
Policing will drop excess traffic.

Think an ISP that has a 1g line to your house, but you only pay for 200mb. The ISP router will police at 200mb, and your home router will shape at 200mb so that your queueing and scheduler will do its calculations based on the shaped bandwidth.


# Configurations

### Classification

```
ip access-list extended PERMIT_ICMP
	permit icmp any any

class-map ICMP
	match access-group name PERMIT_ICMP
```

### Action

```
policy-map POLICE_ICMP
	class ICMP
		police 8000
			confrom-action transmit
			exceed-action drop
```

### Applying to an Interface

```
interface g0/0
	service-policy input POLICE_ICMP
```

# Congestion Management

**FIFO**
SImpliest and easiest to implement
- only paramater is queue depth
Configuration
- Disable previous queueing strategy (default)
- Define queue depth
	- `hold-queue out { num }`
Typically used as part of other soltuions like CBWFQ/HQF

**Fair Queuing**
Also knows as max-min scheduling
Services multiple requests for a shared resource
1. Share resources equally
2. Take excessive amounts
3. Share excess equally among unsatisfied requests

**Weighted Fair Queueing**
Max-min scheduling, but not equal.
- Allocate bandwidth per flow proportional to the weight.
Flow is defined dynamically
- Src/Dst IP + Src/Dst Port + ToS Byte
- Weight is IP Precedence + 1

`fair-queue`

**CBWFQ/HQF**
Allows for defining of custom flows
- Class definition using MQC syntax
- Bandwidth keyword defined class's "weight"
Bandwidth is shared proportionally to its weight
- Relative sharing, not absolute reservation

Every queue in CBWFQ/HQF is FIFO
- Includes class-default
	- always has 1% of int BW
- Buffer-limit with queue-limit command
	- global buffer limit with `hold-queue out`
- Can be turned into Fair Queue
	- command `fair-queue { num of flows }`
	- All flows are equal, no weighing
	- Queue limit per flow is 1/4*queue-limit

# Congestion Avoidance

Tail drop is the default method for all queues.
- Leads to TCP Synchronization
RED is a congestion avoidance technique
- selectively drops flows from the queue before the buffer is 100% full
- goal is to send individual senders into slow start
- result is more even traffic patterns
WRED adds weighting to drop the algorithm
- packets with higher weight are less likely to be dropped

WRED tracks average queue depth
- smoothend based on weight factory
- avg=(old_avg*(1-1/2^n))+(q_size\*1/2^n)
- Drop packets based on Mark Probability Denominator
	- Probability = 1/Mark_Probability_Denominiator
	- Drop probability increases as queue depth increases
	- If queue depth exceeds maximum, tail drop occurs
- Configured in queues as `random-detect`.

![[QoS WRED Drop Thresholds.png]]

In the above example, if the traffic is QoS 0, it will not start using the algorithm until the queue is at the minimum threshold (bandwidth is configured to 50% in the example so the max is 40, so once that is reached it will be the max WRED rate).

# Shaping

```
ip access-list extended ICMP
	permit icmp any any
	
class-map IMCP
	match access-group ICMP
	
policy-map SHAPE
	class ICMP
		shape average 1000
		
interface Gig0/0
	service-policy output SHAPE
```

```
class-map VOIP
	match protocol rtp
	
class-map SQL
	match protocol sqlserver
	
policy-map INNER_POLICY
	class VOIP
		priority 1000
	class SQL
		bandwidth percent 50
		
policy-map OUTER_POLICY
	class class-default
		shape average 5000000
		service-policy INNER_POLICY
		
interface Gig0/0
	service-policy output OUTER_POLICY
```

# Policing

Used to meter a packet flow rate.
Normally an ingress operation (e.g. PE ingress from CE)
- Marks packets that exceed the metered rate
- Drop is the mark action

Applying to MQC
- Three actions (colors): conform, exceed, violate

Shaping is done on egress
Policing is done ingress

Parameters should match
- Shaping is set to match policing
- Policing should usually be the same or higher.

```
policy-map POLICER
	class ICMP
		police cir 8000
		
```