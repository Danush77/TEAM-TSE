import { loadMysqlActivity, loadMysqlTopic } from './mysql'

const moduleLoaders = {
  mysql: {
    topic: loadMysqlTopic,
    activity: loadMysqlActivity,
  },
}

export function loadCourseTopic(moduleId, topicId) {
  return moduleLoaders[moduleId]?.topic(topicId) || Promise.resolve(null)
}

export function loadCourseActivity(moduleId, activityId) {
  return moduleLoaders[moduleId]?.activity(activityId) || Promise.resolve(null)
}
