// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
// ++

import {Injectable, Injector} from "@angular/core";
import {APIv3ResourceCollection, APIv3ResourcePath} from "core-app/modules/apiv3/paths/apiv3-resource";
import {Constructor} from "@angular/cdk/table";
import {Apiv3GridsPaths} from "core-app/modules/apiv3/endpoints/grids/apiv3-grids-paths";
import {Apiv3TimeEntriesPaths} from "core-app/modules/apiv3/endpoints/time-entries/apiv3-time-entries-paths";
import {Apiv3MembershipsPaths} from "core-app/modules/apiv3/endpoints/memberships/apiv3-memberships-paths";
import {APIv3VersionPaths} from "core-app/modules/apiv3/endpoints/versions/apiv3-version-paths";
import {Apiv3UsersPaths} from "core-app/modules/apiv3/endpoints/users/apiv3-users-paths";
import {APIv3TypesPaths} from "core-app/modules/apiv3/endpoints/types/apiv3-types-paths";
import {APIv3QueriesPaths} from "core-app/modules/apiv3/endpoints/queries/apiv3-queries-paths";
import {APIv3ProjectsPaths} from "core-app/modules/apiv3/endpoints/projects/apiv3-projects-paths";
import {PathHelperService} from "core-app/modules/common/path-helper/path-helper.service";
import {APIV3WorkPackagesPaths} from "core-app/modules/apiv3/endpoints/work_packages/api-v3-work-packages-paths";
import {HalResource} from "core-app/modules/hal/resources/hal-resource";
import {APIv3ProjectPaths} from "core-app/modules/apiv3/endpoints/projects/apiv3-project-paths";
import {RootResource} from "core-app/modules/hal/resources/root-resource";
import {StatusResource} from "core-app/modules/hal/resources/status-resource";

@Injectable({ providedIn: 'root' })
export class APIV3Service {
  // /api/v3/attachments
  public readonly attachments = this.apiV3CollectionEndpoint('attachments');

  // /api/v3/configuration
  public readonly configuration = this.apiV3SingularEndpoint('configuration');

  // /api/v3/documents
  public readonly documents = this.apiV3CollectionEndpoint('documents');

  // /api/v3/grids
  public readonly grids = this.apiV3CustomEndpoint(Apiv3GridsPaths);

  // /api/v3/groups
  public readonly groups = this.apiV3CollectionEndpoint('groups');

  // /api/v3/root
  public readonly root = this.apiV3SingularEndpoint<RootResource>('root');

  // /api/v3/statuses
  public readonly statuses = this.apiV3CollectionEndpoint<StatusResource, APIv3ResourcePath<StatusResource>>('statuses');

  // /api/v3/relations
  public readonly relations = this.apiV3CollectionEndpoint('relations');

  // /api/v3/priorities
  public readonly priorities = this.apiV3CollectionEndpoint('priorities');

  // /api/v3/time_entries
  public readonly time_entries = this.apiV3CustomEndpoint(Apiv3TimeEntriesPaths);

  // /api/v3/memberships
  public readonly memberships = this.apiV3CustomEndpoint(Apiv3MembershipsPaths);

  // /api/v3/news
  public readonly news = this.apiV3CollectionEndpoint('news');

  // /api/v3/types
  public readonly types = this.apiV3CustomEndpoint(APIv3TypesPaths);

  // /api/v3/versions
  public readonly versions = this.apiV3CustomEndpoint(APIv3VersionPaths);

  // /api/v3/work_packages
  public readonly work_packages = this.apiV3CustomEndpoint(APIV3WorkPackagesPaths);

  // /api/v3/queries
  public readonly queries = this.apiV3CustomEndpoint(APIv3QueriesPaths);

  // /api/v3/projects
  public readonly projects = this.apiV3CustomEndpoint(APIv3ProjectsPaths);

  // /api/v3/users
  public readonly users = this.apiV3CustomEndpoint(Apiv3UsersPaths);

  // /api/v3/help_texts
  public readonly help_texts = this.apiV3CollectionEndpoint('help_texts');

  // /api/v3/job_statuses
  public readonly job_statuses = this.apiV3CollectionEndpoint('job_statuses');

  constructor(protected readonly injector:Injector,
              protected readonly pathHelper:PathHelperService) {
  }

  /**
   * Returns the part of the API that exists both
   *  - WITHIN a project scope /api/v3/projects/*
   *  - GLOBALLY /api/v3/*
   *
   *  The available API endpoints are being restricted automatically by typescript.
   *
   * @param projectIdentifier
   */
  public withOptionalProject(projectIdentifier:string|number|null|undefined):APIv3ProjectPaths|this {
    if (_.isNil(projectIdentifier)) {
      return this;
    } else {
      return this.projects.id(projectIdentifier);
    }
  }

  private apiV3CollectionEndpoint<V extends HalResource, T extends APIv3ResourcePath<V>>(segment:string, resource?:Constructor<T>) {
    return new APIv3ResourceCollection<V, T>(this.injector, this.pathHelper.api.v3.appBasePath, segment, resource);
  }

  private apiV3CustomEndpoint<T>(cls:Constructor<T>):T {
    return new cls(this.injector, this.pathHelper.api.v3.appBasePath);
  }

  private apiV3SingularEndpoint<T extends HalResource = HalResource>(segment:string) {
    return new APIv3ResourcePath<T>(this.injector, this.pathHelper.api.v3.appBasePath, segment);
  }
}
