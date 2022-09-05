---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}
  [Deep Learning for Prognosis Using Task-fMRI: A Novel Architecture and Training Scheme](https://dl.acm.org/doi/abs/10.1145/3534678.3539362) <br />
  [Deep Learning in Neuroimaging: Overcoming Challenges With Emerging Approaches](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9200984/) <br />

{% for post in site.publications_ reversed %}
  {% include archive-single.html %}
{% endfor %}
