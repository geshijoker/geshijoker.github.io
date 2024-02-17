---
permalink: /
title: "About"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Biography
======
Hi! I'm Ge, a Ph.D. student at the [Computer Science Department](https://cs.ucdavis.edu/) in [University of California, Davis](https://www.ucdavis.edu/). I received my M.S. degree in computer science at the [College of Information and Computer Sciences](https://www.cics.umass.edu/) in [University of Massachusetts, Amherst](https://www.umass.edu/). I received my B.S. degree in Automation from [Zhejiang University](http://www.zju.edu.cn/english/).

Research
======
For my Ph.D., I'm doing research under the supervision of [Prof. Davidson, Ian](https://faculty.engineering.ucdavis.edu/davidson/). I joined Machine Learning and Analytics Group led by [Prof. Mahoney, Michael](https://crd.lbl.gov/divisions/scidata/mla/staff/michael-mahoney/) doing research in loss landscapes and its applications. I did research in the [CV Lab](http://vis-www.cs.umass.edu/?_ga=2.8406261.13071005.1539107294-754893335.1516127699) working with [Prof. Learned-Miller, Erik](https://people.cs.umass.edu/~elm/papers_by_student.html) on my M.S. project (Video Stabilization via Super Congealing). I worked with [Prof. Zhang, Yu](https://person.zju.edu.cn/en/zhangyu) on my B.S. project (SLAM: Simultaneous Localization and Mapping).

My research interests include: Computer Vision, Machine Learning, Artificial Intelligence, Data Mining and Robotics. My area of expertise is explainable AI and transparent models. Details can be found in the research list.

Download the PDF version of
------
[Resume](https://geshijoker.github.io/files/resume.pdf) \
[CV](https://geshijoker.github.io/files/CV.pdf)

Publications
------

{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}
  (Wait!) CRF-transplant: Post-hoc Processing Module Transplant Guarantees Improvements <br />

  (Wait!) Evaluating Loss Landscapes from a Topology Perspective <br />

  (Wait!) HALE: Hierarchical Aggregation of Local Explanations <br />

  (Wait!) Beyond Trial and Error: Unraveling Neural Networks' Insights in Scientific Knowledge Discovery through Bivariate Optimization <br />

  (Wait!) LossLens: Diagnostics for Machine Learning Models through Loss Landscape Visual Analytics <br />

  [SIG: Rethinking Baseline of Integrated Gradients from the Perspective of Shapley Value](https://arxiv.org/abs/2310.04821) <br />

  [Deep Learning for Prognosis Using Task-fMRI: A Novel Architecture and Training Scheme](https://dl.acm.org/doi/abs/10.1145/3534678.3539362) <br />

  [Deep Learning in Neuroimaging: Overcoming Challenges With Emerging Approaches](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9200984/) <br />

  [Data augmentation with Mixup: Enhancing performance of a functional neuroimaging-based prognostic deep learning classifier in recent onset psychosis](https://www.sciencedirect.com/science/article/pii/S2213158222002790) <br />
  
  [Moving Object Proposals with Deep Learned Optical Flow for Video Object Segmentation](https://arxiv.org/abs/2402.08882) <br />

{% for post in site.publications_ reversed %}
  {% include archive-single.html %}
{% endfor %}
