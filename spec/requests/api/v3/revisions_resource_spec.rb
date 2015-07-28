#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

require 'spec_helper'
require 'rack/test'

describe 'API v3 Revisions resource', type: :request do
  include Rack::Test::Methods
  include Capybara::RSpecMatchers
  include API::V3::Utilities::PathHelper

  let(:revision) {
    FactoryGirl.create(:changeset,
                       repository: repository,
                       comments: 'Some commit message',
                       committer: 'foo bar <foo@example.org>'
    )
  }
  let(:repository) {
    FactoryGirl.create(:repository_subversion, project: project)
  }
  let(:project) do
    FactoryGirl.create(:project, identifier: 'test_project', is_public: false)
  end
  let(:role) do
    FactoryGirl.create(:role,
                       permissions: [:view_changesets])
  end
  let(:current_user) do
    FactoryGirl.create(:user, member_in_project: project, member_through_role: role)
  end
  let(:unauthorized_user) { FactoryGirl.create(:user) }

  describe '#get' do
    let(:get_path) { api_v3_paths.revision revision.id }
    let(:expected_response) do
      {
        '_type' => 'Revision',
        '_links' => {
          'self' => {
            'href' => "http://localhost:3000/api/v3/revisions/#{revision.id}"
          },
          'project' => {
            'href' => "http://localhost:3000/api/v3/projects/#{project.id}",
            'title' => project.title
          },
        },
        'id' => revision.id,
        'identifier' => revision.identifier,
        'authorName' => revision.author,
        'message' => {
          'format' => 'plain',
          'raw' => 'Some commit message',
          'html' =>'<p>Some commit message</p>',
        },
        'createdAt' => revision.committed_on.utc.iso8601
      }
    end

    context 'when acting as a user with permission to view work package' do
      before(:each) do
        allow(User).to receive(:current).and_return current_user
        get get_path
      end

      it 'should respond with 200' do
        expect(last_response.status).to eq(200)
      end

      describe 'response body' do
        subject(:parsed_response) { JSON.parse(last_response.body) }

        it 'should respond with revision in HAL+JSON format' do
          expect(parsed_response['id']).to eq(revision.id)
        end
      end

      context 'requesting nonexistent revision' do
        let(:get_path) { api_v3_paths.work_package 909090 }

        it_behaves_like 'not found'
      end
    end

    context 'when acting as an user without permission to view work package' do
      before(:each) do
        allow(User).to receive(:current).and_return unauthorized_user
        get get_path
      end

      it_behaves_like 'not found'
    end

    context 'when acting as an anonymous user' do
      before(:each) do
        allow(User).to receive(:current).and_return User.anonymous
        get get_path
      end

      it_behaves_like 'not found'
    end
  end
end
