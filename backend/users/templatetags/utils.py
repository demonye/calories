from django import template


register = template.Library()


@register.simple_tag
def replace(s, v1, v2):
    print(s)
    return s.replace(v1, v2)
