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
I'm doing research under the supervision of [Prof. Davidson, Ian](https://faculty.engineering.ucdavis.edu/davidson/).
I did research in the [CV Lab](http://vis-www.cs.umass.edu/?_ga=2.8406261.13071005.1539107294-754893335.1516127699) working with [Prof. Learned-Miller, Erik](https://people.cs.umass.edu/~elm/papers_by_student.html). I worked with [Prof. Zhang, Yu](https://person.zju.edu.cn/en/zhangyu) for my B.S. project.

My research interests include: Computer Vision, Machine Learning, Artificial Intelligence and Robotics. Details can be found in the research list.

Download the PDF version of Resume/CV
------
[Resume](https://geshijoker.github.io/files/resume.pdf)

[CV](https://geshijoker.github.io/files/CV.pdf)

Publications
------

{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}
  [Deep Learning for Prognosis Using Task-fMRI: A Novel Architecture and Training Scheme](https://dl.acm.org/doi/abs/10.1145/3534678.3539362) <br />
  [Deep Learning in Neuroimaging: Overcoming Challenges With Emerging Approaches](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9200984/) <br />

{% for post in site.publications_ reversed %}
  {% include archive-single.html %}
{% endfor %}
