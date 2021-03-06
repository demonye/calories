from django import template


register = template.Library()


@register.simple_tag
def replace(s, v1, v2):
    return s.replace(v1, v2)
