import {blogPost} from './documents/blogPost'
import {clinicProfile} from './documents/clinicProfile'
import {condition} from './documents/condition'
import {doctor} from './documents/doctor'
import {redirectMapping} from './documents/redirectMapping'
import {service} from './documents/service'
import {symptom} from './documents/symptom'
import {testimonial} from './documents/testimonial'
import {topic} from './documents/topic'
import {citation} from './objects/citation'
import {externalLink} from './objects/externalLink'
import {faqItem} from './objects/faqItem'
import {imageWithAlt} from './objects/imageWithAlt'
import {richText} from './objects/richText'
import {seoMeta} from './objects/seoMeta'

export const schemaTypes = [
  clinicProfile,
  service,
  blogPost,
  testimonial,
  doctor,
  topic,
  condition,
  symptom,
  redirectMapping,
  citation,
  externalLink,
  faqItem,
  imageWithAlt,
  richText,
  seoMeta,
]
