#!/bin/sh
spring stop
export RAILS_ENV=production
kill `cat tmp/pids/server.pid`
#git pull origin master
bundle install --without test development
export SECRET_KEY_BASE=bundle exec rake secret
bundle exec rails db:migrate RAILS_ENV=production
bundle exec rails assets:precompile RAILS_ENV=production
export SECRET_KEY_BASE=bundle exec rake secret
export RAILS_ENV=production
bundle exec rails s -d -e production -p 3000 -b 0.0.0.0